"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEscalations = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const twilio_1 = __importDefault(require("twilio"));
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
exports.checkEscalations = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async () => {
    var _a, _b, _c, _d, _e, _f;
    const now = new Date();
    const sentReminders = await admin.firestore()
        .collection('reminders')
        .where('status', '==', 'sent')
        .get();
    let twilioClient = null;
    try {
        const sid = (_a = functions.config().twilio) === null || _a === void 0 ? void 0 : _a.account_sid;
        const token = (_b = functions.config().twilio) === null || _b === void 0 ? void 0 : _b.auth_token;
        if (sid && token) {
            twilioClient = (0, twilio_1.default)(sid, token);
        }
    }
    catch (_g) {
        functions.logger.warn('Twilio not configured - escalation SMS will be skipped');
    }
    const twilioPhone = (_c = functions.config().twilio) === null || _c === void 0 ? void 0 : _c.phone_number;
    for (const doc of sentReminders.docs) {
        const reminder = doc.data();
        const sentAt = (_f = (_e = (_d = reminder.sentAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : (reminder.sentAt ? new Date(reminder.sentAt) : null);
        if (!sentAt)
            continue;
        const timeLimitMs = (reminder.responseTimeLimit || 30) * 60 * 1000;
        const deadline = new Date(sentAt.getTime() + timeLimitMs);
        if (now > deadline) {
            await escalateReminder(doc.id, reminder, twilioClient, twilioPhone);
        }
    }
    return null;
});
async function escalateReminder(reminderId, reminder, twilioClient, twilioPhone) {
    const [caregiverDoc, elderlyDoc] = await Promise.all([
        admin.firestore().collection('users').doc(reminder.caregiverId).get(),
        admin.firestore().collection('elderly').doc(reminder.elderlyId).get(),
    ]);
    const caregiver = caregiverDoc.data();
    const elderly = elderlyDoc.data();
    const emergencyContacts = (caregiver === null || caregiver === void 0 ? void 0 : caregiver.emergencyContacts) || [];
    const message = `REMIND ME ALERT: ${(elderly === null || elderly === void 0 ? void 0 : elderly.name) || 'Your loved one'} has not responded to "${reminder.title}" from ${(caregiver === null || caregiver === void 0 ? void 0 : caregiver.name) || 'caregiver'}. Please check on them.`;
    const smsResults = [];
    if (twilioClient && twilioPhone) {
        for (const contact of emergencyContacts) {
            if (!contact.phone)
                continue;
            try {
                await twilioClient.messages.create({
                    body: message,
                    from: twilioPhone,
                    to: contact.phone,
                });
                smsResults.push({ name: contact.name, phone: contact.phone, success: true });
            }
            catch (error) {
                functions.logger.error(`Failed to send SMS to ${contact.phone}:`, error);
                smsResults.push({ name: contact.name, phone: contact.phone, success: false });
            }
        }
    }
    else {
        functions.logger.warn('Twilio not configured - no SMS sent for escalation');
    }
    if (caregiver === null || caregiver === void 0 ? void 0 : caregiver.fcmToken) {
        try {
            await admin.messaging().send({
                token: caregiver.fcmToken,
                notification: {
                    title: 'Missed Reminder Alert',
                    body: `${(elderly === null || elderly === void 0 ? void 0 : elderly.name) || 'Your loved one'} has not responded to "${reminder.title}"`,
                },
                data: { type: 'escalation', reminderId },
                android: { priority: 'high', notification: { sound: 'urgent' } },
                apns: { payload: { aps: { sound: 'urgent.wav' } } },
            });
        }
        catch (err) {
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
        contactsNotified: smsResults.map((r) => (Object.assign(Object.assign({}, r), { notifiedAt: admin.firestore.FieldValue.serverTimestamp(), method: 'sms' }))),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`Escalated reminder ${reminderId}`);
}
//# sourceMappingURL=checkEscalations.js.map