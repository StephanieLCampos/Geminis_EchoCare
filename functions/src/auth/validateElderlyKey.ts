import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Validates an elderly person's 6-character access key and returns a custom
 * Firebase Auth token so they can sign in without email/password.
 *
 * Called by: src/services/authService.ts → loginElderly()
 */
export const validateElderlyKey = functions.https.onCall(async (data) => {
  const accessKey = (data?.accessKey ?? '').toString().toUpperCase().trim();

  if (!accessKey || accessKey.length !== 6) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Access key must be exactly 6 characters'
    );
  }

  // Look up the elderly document by access key
  const snapshot = await admin.firestore()
    .collection('elderly')
    .where('accessKey', '==', accessKey)
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      'Invalid access key. Please check with your caregiver.'
    );
  }

  const elderlyDoc = snapshot.docs[0];
  const elderly = elderlyDoc.data();
  const elderlyId = elderlyDoc.id;

  // Fetch caregiver's name for display
  let caregiverName = 'Your caregiver';
  try {
    const caregiverDoc = await admin.firestore()
      .collection('users')
      .doc(elderly.caregiverId)
      .get();
    caregiverName = caregiverDoc.data()?.name ?? caregiverName;
  } catch {
    // Non-critical — proceed without caregiver name
  }

  // Create a custom auth token for this elderly person.
  // UID is stable: "elderly-{elderlyId}" so they stay signed in.
  const uid = `elderly-${elderlyId}`;
  const customToken = await admin.auth().createCustomToken(uid, {
    role: 'elderly',
    elderlyId,
    caregiverId: elderly.caregiverId,
  });

  // Mark as active with last sign-in time
  await admin.firestore().collection('elderly').doc(elderlyId).update({
    lastActive: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Elderly ${elderlyId} signed in via access key`);

  return {
    customToken,
    elderlyId,
    name: elderly.name ?? 'Friend',
    caregiverName,
  };
});
