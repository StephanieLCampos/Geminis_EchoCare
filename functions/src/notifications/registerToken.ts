import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Registers FCM token for caregiver or elderly user.
 * Called by the app after login.
 */
export const registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { fcmToken } = data;

  if (!fcmToken || typeof fcmToken !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'fcmToken is required');
  }

  const token = context.auth.token as { elderlyId?: string };
  if (token.elderlyId) {
    await admin.firestore().collection('elderly').doc(token.elderlyId).update({
      fcmToken,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await admin.firestore().collection('users').doc(context.auth.uid).update({
      fcmToken,
    });
  }

  return { success: true };
});
