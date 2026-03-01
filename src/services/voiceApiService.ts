/**
 * Voice API service - calls the ElevenLabs voice backend (from test-task5_2).
 * Uses voice sample to clone voice, then text-to-speech for reminders.
 */
import { VOICE_API_BASE_URL } from '../config/voiceApi';

const VOICE_SERVER_TIP = "Ensure voice-backend is running (npm run voice-server). On a physical device, set EXPO_PUBLIC_VOICE_API_URL to your computer's IP in .env.";

export interface VoiceCloneResponse {
  success: boolean;
  voiceId: string;
  voiceName: string;
  duration: string;
}

export interface TextToSpeechResponse {
  success: boolean;
  audioUrl: string;
  originalText: string;
  translatedText?: string | null;
  finalText: string;
  sourceLanguage: string;
  targetLanguage: string;
  totalDuration: string;
}

/**
 * Create an ElevenLabs voice clone from a voice sample (20-30 sec recording).
 * Returns the voiceId to store and use for text-to-speech.
 */
export async function createVoiceClone(
  voiceBlob: Blob,
  voiceName?: string
): Promise<VoiceCloneResponse> {
  const formData = new FormData();
  const isWebm = voiceBlob.type?.includes('webm');
  formData.append('voiceSample', voiceBlob, isWebm ? 'voice_sample.webm' : 'voice_sample.mp3');
  if (voiceName) {
    formData.append('voiceName', voiceName);
  }

  let res: Response;
  try {
    res = await fetch(`${VOICE_API_BASE_URL}/api/voice-clone`, { method: 'POST', body: formData });
  } catch (e) {
    throw new Error(`Cannot reach voice server. ${VOICE_SERVER_TIP}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = typeof err.error === 'string' ? err.error : err.error?.message ?? JSON.stringify(err.error) ?? 'Voice cloning failed';
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Convert text to speech using a cloned voice.
 * Returns the relative audio URL (e.g. /output/xxx.mp3) - prepend base URL to fetch.
 */
export async function textToSpeech(
  text: string,
  voiceId: string,
  options?: {
    sourceLanguage?: string;
    targetLanguage?: string;
    useTranslation?: boolean;
  }
): Promise<TextToSpeechResponse> {
  const body = {
    text,
    voiceId,
    sourceLanguage: options?.sourceLanguage ?? 'en',
    targetLanguage: options?.targetLanguage,
    useTranslation: options?.useTranslation ?? false,
  };

  let res: Response;
  try {
    res = await fetch(`${VOICE_API_BASE_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(`Cannot reach voice server. ${VOICE_SERVER_TIP}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = typeof err.error === 'string' ? err.error : err.error?.message ?? JSON.stringify(err.error) ?? 'Text-to-speech failed';
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Convert WebM video to MP4 for iOS compatibility.
 * Call this before uploading video reminders recorded on web.
 */
export async function convertWebmToMp4(webmBlob: Blob): Promise<Blob> {
  const formData = new FormData();
  formData.append('video', webmBlob, 'video.webm');

  let res: Response;
  try {
    res = await fetch(`${VOICE_API_BASE_URL}/api/convert-video`, { method: 'POST', body: formData });
  } catch (e) {
    throw new Error(`Cannot reach voice server for video conversion. ${VOICE_SERVER_TIP}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = typeof err.error === 'string' ? err.error : err.error?.message ?? 'Video conversion failed';
    throw new Error(msg);
  }

  return res.blob();
}

/**
 * Fetch the generated audio blob from the voice API.
 * audioUrl from textToSpeech is relative (e.g. /output/xxx.mp3).
 */
export async function fetchAudioBlob(audioUrl: string): Promise<Blob> {
  const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${VOICE_API_BASE_URL}${audioUrl}`;
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Failed to fetch audio (${res.status})`);
    return res.blob();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    if (msg.includes('fetch') || msg.includes('Network') || msg.includes('Failed to fetch')) {
      throw new Error(
        'Cannot reach voice server. On a physical device, set EXPO_PUBLIC_VOICE_API_URL to your computer\'s IP (e.g. http://192.168.1.x:3001) in .env. Ensure voice-backend is running (npm run voice-server).'
      );
    }
    throw err;
  }
}
