# Voice Backend (ElevenLabs)

Backend for voice cloning and text-to-speech. Uses the sample voice recording to clone the caregiver's voice, then synthesizes typed text to send to grandma/grandpa.

From: `test-task5_2` (EchoCare Task 5 - API Testing Environment)

## Setup

1. **Install dependencies**
   ```bash
   cd voice-backend
   npm install
   ```

2. **Configure API keys** – copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Required:
   - `ELEVENLABS_API_KEY` – from https://elevenlabs.io → Profile → API Key

   Optional (for translation):
   - `GOOGLE_APPLICATION_CREDENTIALS` – path to Google Cloud service account JSON
   - `GCLOUD_PROJECT` – Google Cloud project ID

3. **Start the server**
   ```bash
   npm start
   ```
   Runs on http://localhost:3001

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API status |
| `/api/voice-clone` | POST | Create voice clone (multipart: `voiceSample` file) |
| `/api/text-to-speech` | POST | Text → speech (body: `text`, `voiceId`, optional `targetLanguage`) |

## Flow

1. **Registration**: Caregiver records 20–30 sec voice sample → uploaded to `/api/voice-clone` → ElevenLabs creates clone → `voiceId` stored in Firestore.
2. **Create reminder**: Caregiver types message → app calls `/api/text-to-speech` with text + `voiceId` → audio generated → uploaded to Firebase Storage → reminder created.

## Connecting the App

- **Web/local**: Default `http://localhost:3001`
- **Physical device**: Use your machine's IP, e.g. `http://192.168.1.x:3001`
- Set `EXPO_PUBLIC_VOICE_API_URL` in `.env` if needed.
