import * as admin from 'firebase-admin';

admin.initializeApp();

export { validateElderlyKey } from './auth/validateElderlyKey';
export { sendScheduledReminders } from './notifications/sendReminder';
export { checkEscalations } from './notifications/checkEscalations';
export { registerFCMToken } from './notifications/registerToken';
