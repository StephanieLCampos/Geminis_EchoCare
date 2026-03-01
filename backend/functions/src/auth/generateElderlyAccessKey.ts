// Generates or rotates elderly profile access key
// Endpoint: generateElderlyAccessKey


import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for generating access key
interface GenerateElderlyAccessKeyRequest {
  elderlyId: string;
}

// Length of generated access keys (6 chars for easy sharing)
const ACCESS_KEY_LENGTH = 6;
// Character set for access keys (excludes O, I, 0, 1 to reduce confusion)
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

// Cloud Function: Generates new access key (caregiver-only)
export const generateElderlyAccessKey = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<GenerateElderlyAccessKeyRequest>) => {
    // Verify caregiver authentication
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {elderlyId} = request.data;
    if (!elderlyId) {
      throw new HttpsError("invalid-argument", "elderlyId is required");
    }

    const elderlyRef = admin.firestore().collection("elderly").doc(elderlyId);
    const elderlyDoc = await elderlyRef.get();

    if (!elderlyDoc.exists) {
      throw new HttpsError("not-found", "Elderly profile not found");
    }

    const elderlyData = elderlyDoc.data() as {
      caregiverId?: string;
      name?: string;
    };
    // Verify caregiver owns this elderly profile
    if (elderlyData.caregiverId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "Not allowed for this elderly profile"
      );
    }

    // Generate unique access key and corresponding custom token
    const accessKey = await generateUniqueAccessKey();
    const customToken = await admin.auth().createCustomToken(elderlyId, {
      elderlyId,
      role: "elderly",
    });

    // Atomically update elderly profile with new key and token
    await elderlyRef.update({
      accessKey,
      isActive: true,
      auth: {
        customToken,
        tokenIssuedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      accessKeyUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      elderlyId,
      accessKey,
      name: elderlyData.name ?? null,
    };
  }
);
