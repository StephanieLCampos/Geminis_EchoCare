// Validates elderly login via access key

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for validating elderly access key
interface ValidateElderlyKeyRequest {
  accessKey: string;
}

// Cloud Function: Validates elderly's 6-character access key
export const validateElderlyKey = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<ValidateElderlyKeyRequest>) => {
    const {accessKey} = request.data;

    // Validate access key format (must be exactly 6 characters)
    if (!accessKey || accessKey.length !== 6) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid access key"
      );
    }

    // Query elderly collection for matching access key + active status
    const elderlySnapshot = await admin.firestore()
      .collection("elderly")
      .where("accessKey", "==", accessKey.toUpperCase())
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (elderlySnapshot.empty) {
      throw new HttpsError("not-found", "Invalid access code");
    }

    const elderlyDoc = elderlySnapshot.docs[0];
    const elderlyData = elderlyDoc.data();

    // Fetch caregiver info to include name in response
    const caregiverDoc = await admin.firestore()
      .collection("caregivers")
      .doc(elderlyData.caregiverId)
      .get();

    // Generate Firebase custom token with elderly claims
    const customToken = await admin.auth().createCustomToken(
      elderlyDoc.id,
      {
        elderlyId: elderlyDoc.id,
        role: "elderly",
      }
    );

    return {
      customToken,
      elderlyId: elderlyDoc.id,
      name: elderlyData.name,
      caregiverName: caregiverDoc.data()?.name,
    };
  }
);
