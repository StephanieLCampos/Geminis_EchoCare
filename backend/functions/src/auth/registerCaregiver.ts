// Register new caregiver account
// Endpoint: registerCaregiver

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for caregiver registration
interface RegisterCaregiverRequest {
  email: string;
  password: string;
  name: string;
}

// Cloud Function: Registers new caregiver account
export const registerCaregiver = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<RegisterCaregiverRequest>) => {
    const {email, password, name} = request.data;

    // Validate all required fields present
    if (!email || !password || !name) {
      throw new HttpsError(
        "invalid-argument",
        "Email, password, and name are required"
      );
    }

    // Enforce minimum password length
    if (password.length < 6) {
      throw new HttpsError(
        "invalid-argument",
        "Password must be at least 6 characters"
      );
    }

    try {
      // Create Firebase Authentication user
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      const userId = userRecord.uid;

      // Create Firestore caregiver document with metadata
      await admin.firestore().collection("caregivers").doc(userId).set({
        email,
        name,
        uid: userId,
        role: "caregiver",
        voiceSampleUrl: null,
        elevenLabsVoiceId: null,
        fcmToken: null,
        notificationSounds: {
          regular: "default",
          emergency: "urgent",
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        userId,
        message: "Caregiver account created successfully",
      };
    } catch (error) {
      // Log the full error for debugging
      console.error("Registration failed:", error);

      // Handle Firebase auth errors and map to appropriate HTTP errors
      const errorMessage = error instanceof Error ?
        error.message :
        String(error);
      if (errorMessage.includes("email-already-exists")) {
        throw new HttpsError("already-exists", "Email already in use");
      }
      if (errorMessage.includes("invalid-email")) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid email address"
        );
      }
      // Return detailed error for debugging
      const msg = `Failed to create account: ${errorMessage}`;
      throw new HttpsError("internal", msg);
    }
  }
);
