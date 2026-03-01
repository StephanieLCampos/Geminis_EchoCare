// Register FCM token for push notifications
// Endpoint: registerFCMToken

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for FCM token registration
interface RegisterFCMTokenRequest {
  fcmToken: string;
}

// Cloud Function: Register FCM token for push notifications
export const registerFCMToken = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<RegisterFCMTokenRequest>) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {fcmToken} = request.data;

    // Validate FCM token provided
    if (!fcmToken || typeof fcmToken !== "string") {
      throw new HttpsError("invalid-argument", "Valid FCM token required");
    }

    try {
      // Check if this is an elderly user (custom token with elderlyId claim)
      if (request.auth.token.elderlyId) {
        const elderlyId = request.auth.token.elderlyId as string;

        // Update elderly document with FCM token
        await admin.firestore()
          .collection("elderly")
          .doc(elderlyId)
          .update({
            fcmToken,
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
          });

        return {
          success: true,
          message: "FCM token registered for elderly user",
          userType: "elderly",
          elderlyId,
        };
      } else {
        // This is a caregiver user (Firebase Auth UID)
        const caregiverId = request.auth.uid;

        // Update caregiver document with FCM token
        await admin.firestore()
          .collection("users")
          .doc(caregiverId)
          .update({
            fcmToken,
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
          });

        return {
          success: true,
          message: "FCM token registered for caregiver",
          userType: "caregiver",
          userId: caregiverId,
        };
      }
    } catch (error) {
      console.error("Failed to register FCM token:", error);
      throw new HttpsError(
        "internal",
        "Failed to register FCM token"
      );
    }
  }
);
