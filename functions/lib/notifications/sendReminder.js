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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScheduledReminders = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Sends scheduled reminders at their due time.
 * Runs every minute. Queries reminders with status 'scheduled' and schedule.time matching current time.
 *
 * Firestore index required:
 * Collection: reminders
 * Fields: status (Asc), schedule.time (Asc)
 */
exports.sendScheduledReminders = functions.pubsub
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
                    const startDate = (startDateVal === null || startDateVal === void 0 ? void 0 : startDateVal.toDate) ? startDateVal.toDate() : new Date(startDateVal);
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
async function sendReminderNotification(reminderId, reminder) {
    var _a, _b;
    const elderlyDoc = await admin.firestore()
        .collection('elderly')
        .doc(reminder.elderlyId)
        .get();
    const fcmToken = (_a = elderlyDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
    if (!fcmToken) {
        functions.logger.warn(`No FCM token for elderly ${reminder.elderlyId}`);
        return;
    }
    const caregiverDoc = await admin.firestore()
        .collection('users')
        .doc(reminder.caregiverId)
        .get();
    const sounds = ((_b = caregiverDoc.data()) === null || _b === void 0 ? void 0 : _b.notificationSounds) || {};
    const sound = reminder.priority === 'emergency' ? sounds.emergency : sounds.regular;
    const message = {
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
function getCategoryMessage(category) {
    const messages = {
        medication: 'Time for your medication',
        daily_task: 'You have a task to complete',
        appointment: 'Reminder about your appointment',
        other: 'You have a new reminder',
    };
    return messages[category] || messages.other;
}
function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
//# sourceMappingURL=sendReminder.js.map