/**
 * Voice cloning API base URL.
 * - Dev: http://localhost:3001 (run voice-backend with `cd voice-backend && npm start`)
 * - Physical device: Use your machine's IP, e.g. http://192.168.1.x:3001
 * - Prod: Deploy voice-backend and set EXPO_PUBLIC_VOICE_API_URL
 */
export const VOICE_API_BASE_URL =
  process.env.EXPO_PUBLIC_VOICE_API_URL ?? 'http://localhost:3001';

/** When true, skip Firebase auth - login/register proceed without Firebase. Set EXPO_PUBLIC_DEMO_MODE=true to enable when Firebase isn't working. */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
