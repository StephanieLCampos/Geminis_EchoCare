import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== 'granted') return null;
  }

  const tokenData = await Notifications.getDevicePushTokenAsync();
  const token = tokenData?.data ?? null;
  return token;
}

export async function registerFCMTokenWithBackend(token: string): Promise<void> {
  try {
    const registerFCMToken = httpsCallable(functions, 'registerFCMToken');
    await registerFCMToken({ fcmToken: token });
  } catch (err) {
    console.warn('registerFCMToken Cloud Function may not be deployed:', err);
  }
}

export async function updateUserFCMToken(userId: string, token: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { fcmToken: token });
}

export async function setupPushNotifications(userId: string): Promise<void> {
  const token = await registerForPushNotifications();
  if (token) {
    await updateUserFCMToken(userId, token);
    await registerFCMTokenWithBackend(token);
  }
}
