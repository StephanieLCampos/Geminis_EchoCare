// Create elderly profile with auto-generated access key
// Endpoint: createElderlyProfile

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for creating elderly profile
interface CreateElderlyProfileRequest {
  name: string;
  notes?: string;
}

// Length of generated access keys (6 chars for easy sharing)
const ACCESS_KEY_LENGTH = 6;
// Character set for access keys
const ACCESS_KEY_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Builds a random access key from charset
const buildAccessKey = (): string => {
  let accessKey = "";
  for (let index = 0; index < ACCESS_KEY_LENGTH; index++) {
    const randomIndex = Math.floor(Math.random() * ACCESS_KEY_CHARSET.length);
    accessKey += ACCESS_KEY_CHARSET[randomIndex];
  }
  return accessKey;
};

// Generates unique access key by checking Firestore for collisions
// Retries up to 10 times to ensure uniqueness
const generateUniqueAccessKey = async (): Promise<string> => {
  // Try up to 10 times to avoid collision with existing keys
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidateKey = buildAccessKey();
    const existing = await admin.firestore()
      .collection("elderly")
      .where("accessKey", "==", candidateKey)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (existing.empty) {
      return candidateKey;
    }
  }

  throw new HttpsError("resource-exhausted", "Unable to generate access key");
};

// Cloud Function: Creates new elderly profile (caregiver-only)
export const createElderlyProfile = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<CreateElderlyProfileRequest>) => {
    // Verify caregiver authentication
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {name, notes = ""} = request.data;
    const caregiverId = request.auth.uid;

    // Validate required fields
    if (!name) {
      throw new HttpsError("invalid-argument", "Elderly name is required");
    }

    try {
      // Generate unique access key for elderly login
      const accessKey = await generateUniqueAccessKey();

      // Create elderly profile without auth field first to get real ID
      // This allows us to use the actual doc ID for the custom token
      const elderlyRef = await admin.firestore()
        .collection("elderly")
        .add({
          name,
          notes,
          accessKey,
          caregiverId,
          profileImage: null,
          fcmToken: null,
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Create custom token with actual elderlyId
      const customToken = await admin
        .auth()
        .createCustomToken(
          elderlyRef.id,
          {
            role: "elderly",
          }
        );

      // Update document with auth token
      await elderlyRef.update({
        auth: {
          customToken,
          tokenIssuedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      return {
        success: true,
        elderlyId: elderlyRef.id,
        name,
        accessKey,
        message: "Elderly profile created successfully",
      };
    } catch (error) {
      throw new HttpsError("internal", "Failed to create elderly profile");
    }
  }
);
