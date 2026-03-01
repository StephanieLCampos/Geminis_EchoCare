export interface Elderly {
  id: string;
  caregiverId: string;
  name: string;
  accessKey?: string;
  profileImage?: string;
  fcmToken?: string | null;
  isActive?: boolean;
  medications?: Medication[];
  createdAt: string | { toDate?: () => Date };
}

export interface Medication {
  id: string;
  elderlyId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  caregiverId: string;
  elderlyId: string;
  type: 'video' | 'audio';
  mediaUrl?: string;
  title: string;
  taskInfo?: string;
  priority?: string;
  category?: string;
  medicationId?: string | null;
  schedule: ReminderSchedule | Record<string, unknown>;
  responseTimeLimit?: number;
  status?: string;
  sentAt?: string | null;
  acknowledgedAt?: string | null;
  escalatedAt?: string | null;
  createdAt: string | { toDate?: () => Date };
}

export interface ReminderSchedule {
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  days?: number[];
  dayOfMonth?: number;
  time: string;
  startDate?: Date; // For 'once' frequency
  timezone?: string;
}
