# EchoCare – Remind Me

**Personalized reminders connecting caregivers with elderly loved ones.** Caregivers create video, voice-cloned, or text reminders; elderly recipients receive them with familiar voices and simple, accessible interfaces.

Built for Hack for Humanity 2026.

---

## Features

### Caregiver Portal
- **Multi-step registration** — Name, email, password, elderly's name, and a 20–30 second voice sample
- **Voice cloning** — ElevenLabs creates a voice clone for personalized reminders
- **Dashboard** — Manage care recipients and view today's reminders
- **Video reminders** — Record video messages (WebM→MP4 conversion for iOS)
- **Voice reminders** — Type text, hear it in your cloned voice, translate to multiple languages
- **Scheduling** — One-time, daily, weekly, or monthly
- **Emergency contacts** — Add contacts notified when a reminder isn't acknowledged
- **Notification sounds** — Customizable regular and emergency sounds

### Elderly Portal
- **Simple login** — 6-character access key (no passwords)
- **Task broadcast** — Video and reminder shown on the home screen
- **Large, accessible UI** — Big text and touch targets
- **Countdown timer** — 2-minute response window
- **Done button** — Mark reminders complete; escalation if no response

### Backend & Integrations
- **Firebase** — Auth, Firestore, Storage, Cloud Functions
- **ElevenLabs** — Voice cloning and text-to-speech
- **Google Translate** — Multilingual reminder support
- **FCM** — Push notifications (when configured)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native, Expo SDK 54, TypeScript |
| **UI** | React Native Paper |
| **Backend** | Node.js, Express (voice API) |
| **Database** | Cloud Firestore |
| **Auth** | Firebase Authentication |
| **Storage** | Firebase Storage |
| **Voice/AI** | ElevenLabs, Google Cloud Translation |
| **Video** | ffmpeg (WebM→MP4 for iOS) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go (for mobile testing)
- Firebase project

### 1. Clone and install

```bash
git clone https://github.com/StephanieLCampos/Geminis_EchoCare.git
cd Geminis_EchoCare
npm install
cd voice-backend && npm install && cd ..
```

### 2. Configure environment

**Root `.env`** (for Expo):

```env
EXPO_PUBLIC_VOICE_API_URL=http://YOUR_IP:3001
```

> On a physical device, use your computer's LAN IP (e.g. `http://192.168.1.100:3001`). For web/simulator, `http://localhost:3001` works.

**Voice backend `voice-backend/.env`**:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
PORT=3001
```

Optional for translation:

```env
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
# or
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
```

### 3. Start the voice server

```bash
npm run voice-server
```

Leave this running. It provides voice cloning, text-to-speech, and video conversion.

### 4. Run the app

```bash
# Web
npm run web

# Or Expo (scan QR with Expo Go)
npm start
```

### 5. Deploy Firestore rules (when using Firebase)

```bash
npm exec -- firebase deploy --only firestore:rules
```

---

## Project Structure

```
├── src/
│   ├── components/       # AudioRecorder, VideoRecorder, etc.
│   ├── config/           # Firebase, voice API config
│   ├── screens/          # Auth, dashboard, reminders, elderly
│   ├── services/         # auth, reminder, voice, elderly
│   └── navigation/      # App navigator
├── voice-backend/        # ElevenLabs + video conversion API
│   ├── routes/
│   │   ├── voiceClone.js
│   │   ├── textToSpeech.js
│   │   └── convertVideo.js
│   └── scheduler.js     # Reminder delivery scheduler
├── functions/            # Firebase Cloud Functions
└── assets/               # Icons, sounds, splash
```

---

## Team & Architecture

EchoCare uses a Firebase-centered architecture. See [team_prompts_tasks.md](team_prompts_tasks.md) for:

- Team roles (PM, Frontend, Backend, Voice, DevOps)
- Firestore schema and security rules
- Cloud Functions design
- Implementation guides per role

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run web` | Run in browser |
| `npm run voice-server` | Start voice backend (port 3001) |
| `npm exec -- firebase deploy --only firestore:rules` | Deploy Firestore rules |

---

## Demo Mode

If Firebase is unavailable, set `EXPO_PUBLIC_DEMO_MODE=true` in `.env` to skip auth and run the caregiver flow in demo mode.

---

## License

Built for Hack for Humanity 2026.
