import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Elderly, Medication } from '../types';

const ELDERLY_COLLECTION = 'elderly';
const MEDICATIONS_COLLECTION = 'medications';

const generateAccessKey = async (): Promise<string> => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  let isUnique = false;

  while (!isUnique) {
    key = '';
    for (let i = 0; i < 6; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const q = query(collection(db, ELDERLY_COLLECTION), where('accessKey', '==', key));
    const snapshot = await getDocs(q);
    isUnique = snapshot.empty;
  }
  return key;
};

export const createElderly = async (
  caregiverId: string,
  name: string,
  profileImage?: Blob
) => {
  const accessKey = await generateAccessKey();

  let profileImageUrl: string | null = null;
  if (profileImage) {
    const imageRef = ref(storage, `elderly-profiles/${Date.now()}.jpg`);
    await uploadBytes(imageRef, profileImage);
    profileImageUrl = await getDownloadURL(imageRef);
  }

  const elderlyRef = await addDoc(collection(db, ELDERLY_COLLECTION), {
    name,
    accessKey,
    caregiverId,
    profileImage: profileImageUrl,
    fcmToken: null,
    isActive: true,
    createdAt: new Date(),
  });

  return { id: elderlyRef.id, accessKey };
};

export const getElderlyByUser = async (caregiverId: string): Promise<Elderly[]> => {
  const q = query(
    collection(db, ELDERLY_COLLECTION),
    where('caregiverId', '==', caregiverId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      caregiverId: data.caregiverId,
      name: data.name,
      accessKey: data.accessKey,
      profileImage: data.profileImage,
      fcmToken: data.fcmToken,
      isActive: data.isActive,
      createdAt: data.createdAt,
    } as Elderly;
  });
};

export const getElderlyById = async (id: string): Promise<Elderly | null> => {
  const docSnap = await getDoc(doc(db, ELDERLY_COLLECTION, id));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    caregiverId: data.caregiverId,
    name: data.name,
    accessKey: data.accessKey,
    profileImage: data.profileImage,
    fcmToken: data.fcmToken,
    isActive: data.isActive,
    createdAt: data.createdAt,
  } as Elderly;
};

export const updateElderly = async (id: string, data: Partial<Elderly>): Promise<void> => {
  await updateDoc(doc(db, ELDERLY_COLLECTION, id), data);
};

export const deleteElderly = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, ELDERLY_COLLECTION, id));
};

export const addMedication = async (
  elderlyId: string,
  data: Omit<Medication, 'id' | 'elderlyId' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, MEDICATIONS_COLLECTION), {
    ...data,
    elderlyId,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getMedicationsByElderly = async (elderlyId: string): Promise<Medication[]> => {
  const q = query(
    collection(db, MEDICATIONS_COLLECTION),
    where('elderlyId', '==', elderlyId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Medication));
};

export const getMedicationById = async (id: string): Promise<Medication | null> => {
  const docSnap = await getDoc(doc(db, MEDICATIONS_COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Medication;
};
