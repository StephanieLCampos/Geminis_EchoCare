/**
 * Notification sounds from assets/sounds/ (used in create account + settings).
 * Stored values are `id` (used by backend/FCM); UI shows `label`.
 */
export interface SoundOption {
  id: string;
  label: string;
}

/** Regular reminder sounds (chimes, calm) */
export const REGULAR_SOUNDS: SoundOption[] = [
  { id: 'gentle bell chime', label: 'Gentle Bell Chimes' },
  { id: 'soundwaves', label: 'Soundwaves' },
  { id: 'xylephones', label: 'Xylephones' },
  { id: 'waves', label: 'Waves' },
  { id: 'bells', label: 'Bells' },
];

/** Emergency/urgent sounds */
export const EMERGENCY_SOUNDS: SoundOption[] = [
  { id: 'urgent alarm sound', label: 'Urgent Alarm Sound' },
  { id: 'urgent alarm sound 2', label: 'Urgent Alarm Sound 2' },
  { id: 'urgent alarm sound 3 (clock)', label: 'Urgent Alarm Sound 3 (Clock)' },
];

/** Asset map for playback: id -> require() */
export const SOUND_ASSETS: Record<string, number> = {
  'gentle bell chime': require('../../assets/sounds/gentle bell chime.mp3'),
  soundwaves: require('../../assets/sounds/soundwaves.mp3'),
  xylephones: require('../../assets/sounds/xylephones.mp3'),
  waves: require('../../assets/sounds/waves.mp3'),
  bells: require('../../assets/sounds/bells.mp3'),
  'urgent alarm sound': require('../../assets/sounds/urgent alarm sound.mp3'),
  'urgent alarm sound 2': require('../../assets/sounds/urgent alarm sound 2.mp3'),
  'urgent alarm sound 3 (clock)': require('../../assets/sounds/urgent alarm sound 3 (clock).mp3'),
};

export const DEFAULT_REGULAR_ID = REGULAR_SOUNDS[0].id;
export const DEFAULT_EMERGENCY_ID = EMERGENCY_SOUNDS[0].id;

/** Get display label for a stored sound id (or legacy label). */
export function getSoundLabel(idOrLabel: string, kind: 'regular' | 'emergency'): string {
  const list = kind === 'regular' ? REGULAR_SOUNDS : EMERGENCY_SOUNDS;
  const found = list.find((s) => s.id === idOrLabel || s.label === idOrLabel);
  return found ? found.label : idOrLabel || 'Default';
}
