import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../types/models';

const STORAGE_KEY = 'echocare.app.data.v1';

const EMPTY_STATE: AppData = {
  caregivers: [],
  reminders: [],
  session: {
    role: 'none',
  },
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_STATE;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return EMPTY_STATE;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateElderKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  for (let index = 0; index < 6; index += 1) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}