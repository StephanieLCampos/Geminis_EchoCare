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

const generateUniqueAccessKey = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidateKey = buildAccessKey();

    try {
      // Query ONLY by accessKey
      const existing = await admin.firestore()
        .collection("elderly")
        .where("accessKey", "==", candidateKey)
        .limit(1)
        .get();

      if (existing.empty) {
        return candidateKey;
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      continue;
    }
  }

  throw new HttpsError("resource-exhausted", "Unable to generate access key");
};

export const createElderlyProfile = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<CreateElderlyProfileRequest>) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {name, notes = ""} = request.data;
    const caregiverId = request.auth.uid;

    if (!name) {
      throw new HttpsError("invalid-argument", "Elderly name is required");
    }

    try {
      const accessKey = await generateUniqueAccessKey();

      // Create elderly profile - SIMPLIFIED (no auth field)
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

      // Create custom token with elderly ID
      const customToken = await admin
        .auth()
        .createCustomToken(elderlyRef.id, {
          role: "elderly",
        });

      return {
        success: true,
        elderlyId: elderlyRef.id,
        name,
        accessKey,
        customToken,
        message: "Elderly profile created successfully",
      };
    } catch (error) {
      console.error("createElderlyProfile error:", error);
      const msg = `Failed to create elderly profile: ${error}`;
      throw new HttpsError("internal", msg);
    }
  }
);
