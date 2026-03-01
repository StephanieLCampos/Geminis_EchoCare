import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  AppData,
  CaregiverAccount,
  ElderlyProfile,
  Reminder,
  SessionState,
} from '../types/models';

interface CreateCaregiverPayload {
  caregiverName: string;
  email: string;
  password: string;
  elderly: Omit<ElderlyProfile, 'id' | 'accessKey'>;
}

interface AddElderPayload {
  caregiverId: string;
  elderly: ElderlyProfile;
}

interface SignInCaregiverPayload {
  caregiverId: string;
}

interface SignInElderlyPayload {
  caregiverId: string;
  elderlyId: string;
}

interface RootStateLike {
  app: AppData;
}

const initialState: AppData = {
  caregivers: [],
  reminders: [],
  session: {
    role: 'none',
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    hydrateState: (_state, action: PayloadAction<AppData>) => action.payload,
    createCaregiverAccount: (state, action: PayloadAction<CaregiverAccount>) => {
      state.caregivers.push(action.payload);
    },
    addElderlyToCaregiver: (state, action: PayloadAction<AddElderPayload>) => {
      const caregiver = state.caregivers.find(
        (item) => item.id === action.payload.caregiverId,
      );
      if (!caregiver) {
        return;
      }
      caregiver.elders.push(action.payload.elderly);
    },
    signInCaregiver: (state, action: PayloadAction<SignInCaregiverPayload>) => {
      state.session = {
        role: 'caregiver',
        caregiverId: action.payload.caregiverId,
      };
    },
    signInElderly: (state, action: PayloadAction<SignInElderlyPayload>) => {
      state.session = {
        role: 'elderly',
        caregiverId: action.payload.caregiverId,
        elderlyId: action.payload.elderlyId,
      };
    },
    signOut: (state) => {
      state.session = { role: 'none' };
    },
    createReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.unshift(action.payload);
    },
    markReminderCompleted: (
      state,
      action: PayloadAction<{ reminderId: string }>,
    ) => {
      const reminder = state.reminders.find((item) => item.id === action.payload.reminderId);
      if (!reminder) {
        return;
      }
      reminder.status = 'completed';
    },
    runEscalationCheck: (state, action: PayloadAction<{ nowIso: string }>) => {
      const now = new Date(action.payload.nowIso).getTime();
      state.reminders.forEach((reminder) => {
        if (reminder.status !== 'pending') {
          return;
        }
        const due = new Date(reminder.dueAt).getTime();
        const window = reminder.responseWindowMinutes * 60 * 1000;
        if (now > due + window) {
          reminder.status = 'escalated';
        } else if (now > due) {
          reminder.status = 'missed';
        }
      });
    },
  },
});

export const {
  hydrateState,
  createCaregiverAccount,
  addElderlyToCaregiver,
  signInCaregiver,
  signInElderly,
  signOut,
  createReminder,
  markReminderCompleted,
  runEscalationCheck,
} = appSlice.actions;

export const appReducer = appSlice.reducer;

export const selectSession = (state: RootStateLike) => state.app.session;
export const selectCaregivers = (state: RootStateLike) => state.app.caregivers;
export const selectReminders = (state: RootStateLike) => state.app.reminders;

export const selectCurrentCaregiver = (state: RootStateLike) => {
  const caregiverId = state.app.session.caregiverId;
  return state.app.caregivers.find((item) => item.id === caregiverId);
};

export const selectCurrentElderly = (state: RootStateLike) => {
  const caregiver = selectCurrentCaregiver(state);
  const elderlyId = state.app.session.elderlyId;
  return caregiver?.elders.find((elder) => elder.id === elderlyId);
};