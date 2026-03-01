import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

interface ValidateElderlyKeyRequest {
  accessKey: string;
}

export const validateElderlyKey = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<ValidateElderlyKeyRequest>) => {
    const {accessKey} = request.data;

    if (!accessKey || accessKey.length !== 6) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid access key"
      );
    }

    // Find elderly by access key
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

    // Get caregiver name
    const caregiverDoc = await admin.firestore()
      .collection("users")
      .doc(elderlyData.caregiverId)
      .get();

    // Create custom token with elderlyId claim
    const customToken = await admin.auth().createCustomToken(elderlyDoc.id, {
      elderlyId: elderlyDoc.id,
      role: "elderly",
    });

    return {
      customToken,
      elderlyId: elderlyDoc.id,
      name: elderlyData.name,
      caregiverName: caregiverDoc.data()?.name,
    };
  }
);
