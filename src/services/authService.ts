import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions } from '../config/firebase';
import { createVoiceClone } from './voiceApiService';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface NotificationSounds {
  regular: string;
  emergency: string;
}

export const registerCaregiver = async (
  email: string,
  password: string,
  name: string,
  voiceFile: Blob | null,
  emergencyContacts: EmergencyContact[] = [],
  notificationSounds: NotificationSounds = { regular: 'default', emergency: 'urgent' }
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  let voiceSampleUrl: string | null = null;
  let elevenLabsVoiceId: string | null = null;

  // Voice sample is required — clone and store for use in voice messages
  if (!voiceFile) {
    throw new Error('Voice sample is required for account setup.');
  }

  try {
    const voiceRef = ref(storage, `voice-samples/${userId}.webm`);
    await uploadBytes(voiceRef, voiceFile);
    voiceSampleUrl = await getDownloadURL(voiceRef);
  } catch (err) {
    console.warn('Voice sample upload failed:', err);
  }

  try {
    const { voiceId } = await createVoiceClone(voiceFile, `caregiver-${userId}`);
    elevenLabsVoiceId = voiceId;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Voice clone failed. Ensure the voice server is running (npm run voice-server).'
    );
  }

  await setDoc(doc(db, 'users', userId), {
    email,
    name,
    voiceSampleUrl,
    elevenLabsVoiceId,
    fcmToken: null,
    notificationSounds,
    emergencyContacts,
    createdAt: new Date(),
  });

  return userId;
};

export const loginCaregiver = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginElderly = async (accessKey: string, fcmToken?: string) => {
  const validateKey = httpsCallable(functions, 'validateElderlyKey');
  const result = await validateKey({ accessKey: accessKey.toUpperCase() });
  const { customToken } = result.data as { customToken: string; elderlyId: string; name: string; caregiverName: string };

  await signInWithCustomToken(auth, customToken);

  if (fcmToken) {
    const { elderlyId } = result.data as { elderlyId: string };
    await updateDoc(doc(db, 'elderly', elderlyId), {
      fcmToken,
      lastActive: new Date(),
    });
  }

  return result.data;
};

/**
 * Update the caregiver's voice sample. Use when recording in Settings.
 * Creates ElevenLabs clone and stores in Firestore.
 */
export const updateCaregiverVoice = async (voiceFile: Blob): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  let voiceSampleUrl: string | null = null;
  let elevenLabsVoiceId: string | null = null;

  try {
    const voiceRef = ref(storage, `voice-samples/${userId}.webm`);
    await uploadBytes(voiceRef, voiceFile);
    voiceSampleUrl = await getDownloadURL(voiceRef);
  } catch (err) {
    console.warn('Voice sample upload failed:', err);
  }

  const { voiceId } = await createVoiceClone(voiceFile, `caregiver-${userId}`);
  elevenLabsVoiceId = voiceId;

  await setDoc(
    doc(db, 'users', userId),
    {
      voiceSampleUrl: voiceSampleUrl ?? undefined,
      elevenLabsVoiceId,
      voiceUpdatedAt: new Date(),
    },
    { merge: true }
  );
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
