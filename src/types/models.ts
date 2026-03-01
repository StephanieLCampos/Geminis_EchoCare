export type ReminderPriority = 'basic' | 'important' | 'emergency';

export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface AudioPreferences {
  basicToneId: string;
  urgentToneId: string;
}

export interface ElderlyProfile {
  id: string;
  name: string;
  accessKey: string;
  voiceId: string;
  medications: MedicationEntry[];
  emergencyContact: EmergencyContact;
  audioPreferences: AudioPreferences;
}

export interface CaregiverAccount {
  id: string;
  caregiverName: string;
  email: string;
  password: string;
  elders: ElderlyProfile[];
}

export interface Reminder {
  id: string;
  caregiverId: string;
  elderlyId: string;
  title: string;
  messageText: string;
  sourceType: 'video' | 'tts' | 'audio';
  mediaUri?: string;
  aiSummary?: string;
  frequency: 'once' | 'daily' | 'weekly';
  priority: ReminderPriority;
  medicationName?: string;
  medicationImage?: string;
  medicationDosage?: string;
  responseWindowMinutes: number;
  createdAt: string;
  dueAt: string;
  status: 'pending' | 'completed' | 'missed' | 'escalated';
  translatedLanguage?: string;
}

export interface SessionState {
  role: 'none' | 'caregiver' | 'elderly';
  caregiverId?: string;
  elderlyId?: string;
}

export interface AppData {
  caregivers: CaregiverAccount[];
  reminders: Reminder[];
  session: SessionState;
}