import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Sends scheduled reminders at their due time.
 * Runs every minute. Queries reminders with status 'scheduled' and schedule.time matching current time.
 *
 * Firestore index required:
 * Collection: reminders
 * Fields: status (Asc), schedule.time (Asc)
 */
export const sendScheduledReminders = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentDate = now.getDate(); // 1-31

    const remindersSnapshot = await admin.firestore()
      .collection('reminders')
      .where('status', '==', 'scheduled')
      .where('schedule.time', '==', currentTime)
      .get();

    for (const doc of remindersSnapshot.docs) {
      const reminder = doc.data();
      const schedule = reminder.schedule || {};

      let shouldSend = false;

      switch (schedule.type) {
        case 'once':
          const startDateVal = schedule.startDate;
          if (startDateVal) {
            const startDate = startDateVal?.toDate ? startDateVal.toDate() : new Date(startDateVal);
            shouldSend = isSameDay(startDate, now);
          }
          break;
        case 'daily':
          shouldSend = true;
          break;
        case 'weekly':
          const daysOfWeek = schedule.daysOfWeek || [];
          shouldSend = daysOfWeek.includes(currentDay);
          break;
        case 'monthly':
          shouldSend = schedule.dayOfMonth === currentDate;
          break;
        default:
          shouldSend = true;
          break;
      }

      if (shouldSend) {
        await sendReminderNotification(doc.id, reminder);
      }
    }

    return null;
  });

async function sendReminderNotification(reminderId: string, reminder: admin.firestore.DocumentData) {
  const elderlyDoc = await admin.firestore()
    .collection('elderly')
    .doc(reminder.elderlyId)
    .get();

  const fcmToken = elderlyDoc.data()?.fcmToken;

  if (!fcmToken) {
    functions.logger.warn(`No FCM token for elderly ${reminder.elderlyId}`);
    return;
  }

  const caregiverDoc = await admin.firestore()
    .collection('users')
    .doc(reminder.caregiverId)
    .get();

  const sounds = caregiverDoc.data()?.notificationSounds || {};
  const sound = reminder.priority === 'emergency' ? sounds.emergency : sounds.regular;

  const message: admin.messaging.Message = {
    token: fcmToken,
    notification: {
      title: reminder.title || 'Reminder',
      body: getCategoryMessage(reminder.category),
    },
    data: {
      reminderId,
      type: reminder.type || 'other',
      priority: reminder.priority || 'regular',
    },
    android: {
      priority: reminder.priority === 'emergency' ? 'high' : 'normal',
      notification: {
        sound: sound || 'default',
        channelId: reminder.priority === 'emergency' ? 'emergency' : 'reminders',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: sound ? `${sound}.wav` : 'default',
          badge: 1,
        },
      },
    },
  };

  await admin.messaging().send(message);

  await admin.firestore().collection('reminders').doc(reminderId).update({
    status: 'sent',
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Sent reminder ${reminderId} to ${reminder.elderlyId}`);
}

function getCategoryMessage(category: string): string {
  const messages: Record<string, string> = {
    medication: 'Time for your medication',
    daily_task: 'You have a task to complete',
    appointment: 'Reminder about your appointment',
    other: 'You have a new reminder',
  };
  return messages[category] || messages.other;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
