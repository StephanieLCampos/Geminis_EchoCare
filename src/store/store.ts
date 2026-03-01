import { configureStore } from '@reduxjs/toolkit';
import { appReducer } from './appSlice';
import { loadAppData, saveAppData } from '../services/storage';
import { AppData } from '../types/models';

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

let hasHydrated = false;

export async function hydrateStore(setter: (data: AppData) => void) {
  const state = await loadAppData();
  setter(state);
  hasHydrated = true;
}

store.subscribe(() => {
  if (!hasHydrated) {
    return;
  }
  const state = store.getState().app;
  saveAppData(state);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;