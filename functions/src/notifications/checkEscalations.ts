import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

/**
 * Checks for sent reminders that weren't acknowledged within responseTimeLimit.
 * Sends SMS to emergency contacts via Twilio and notifies caregiver via FCM.
 * Runs every minute.
 *
 * Required config (set by Irene/Ray):
 * firebase functions:config:set twilio.account_sid="YOUR_SID"
 * firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
 * firebase functions:config:set twilio.phone_number="+1234567890"
 */
export const checkEscalations = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const now = new Date();

    const sentReminders = await admin.firestore()
      .collection('reminders')
      .where('status', '==', 'sent')
      .get();

    let twilioClient: ReturnType<typeof twilio> | null = null;
    try {
      const sid = functions.config().twilio?.account_sid;
      const token = functions.config().twilio?.auth_token;
      if (sid && token) {
        twilioClient = twilio(sid, token);
      }
    } catch {
      functions.logger.warn('Twilio not configured - escalation SMS will be skipped');
    }

    const twilioPhone = functions.config().twilio?.phone_number;

    for (const doc of sentReminders.docs) {
      const reminder = doc.data();
      const sentAt = reminder.sentAt?.toDate?.() ?? (reminder.sentAt ? new Date(reminder.sentAt) : null);

      if (!sentAt) continue;

      const timeLimitMs = (reminder.responseTimeLimit || 30) * 60 * 1000;
      const deadline = new Date(sentAt.getTime() + timeLimitMs);

      if (now > deadline) {
        await escalateReminder(doc.id, reminder, twilioClient, twilioPhone);
      }
    }

    return null;
  });

async function escalateReminder(
  reminderId: string,
  reminder: admin.firestore.DocumentData,
  twilioClient: ReturnType<typeof twilio> | null,
  twilioPhone: string | undefined
) {
  const [caregiverDoc, elderlyDoc] = await Promise.all([
    admin.firestore().collection('users').doc(reminder.caregiverId).get(),
    admin.firestore().collection('elderly').doc(reminder.elderlyId).get(),
  ]);

  const caregiver = caregiverDoc.data();
  const elderly = elderlyDoc.data();
  const emergencyContacts = caregiver?.emergencyContacts || [];

  const message = `REMIND ME ALERT: ${elderly?.name || 'Your loved one'} has not responded to "${reminder.title}" from ${caregiver?.name || 'caregiver'}. Please check on them.`;

  const smsResults: Array<{ name: string; phone: string; success: boolean; notifiedAt?: admin.firestore.FieldValue; method?: string }> = [];

  if (twilioClient && twilioPhone) {
    for (const contact of emergencyContacts) {
      if (!contact.phone) continue;
      try {
        await twilioClient.messages.create({
          body: message,
          from: twilioPhone,
          to: contact.phone,
        });
        smsResults.push({ name: contact.name, phone: contact.phone, success: true });
      } catch (error) {
        functions.logger.error(`Failed to send SMS to ${contact.phone}:`, error);
        smsResults.push({ name: contact.name, phone: contact.phone, success: false });
      }
    }
  } else {
    functions.logger.warn('Twilio not configured - no SMS sent for escalation');
  }

  if (caregiver?.fcmToken) {
    try {
      await admin.messaging().send({
        token: caregiver.fcmToken,
        notification: {
          title: 'Missed Reminder Alert',
          body: `${elderly?.name || 'Your loved one'} has not responded to "${reminder.title}"`,
        },
        data: { type: 'escalation', reminderId },
        android: { priority: 'high' as const, notification: { sound: 'urgent' } },
        apns: { payload: { aps: { sound: 'urgent.wav' } } },
      });
    } catch (err) {
      functions.logger.error('Failed to send caregiver FCM:', err);
    }
  }

  await admin.firestore().collection('reminders').doc(reminderId).update({
    status: 'escalated',
    escalatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await admin.firestore().collection('escalationLogs').add({
    reminderId,
    elderlyId: reminder.elderlyId,
    caregiverId: reminder.caregiverId,
    contactsNotified: smsResults.map((r) => ({
      ...r,
      notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      method: 'sms',
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Escalated reminder ${reminderId}`);
}
