# Remind Me – Status & Remaining Tasks

## How to Demo Voice Cloning (Without Firebase)

1. **Start the voice backend**
   ```bash
   npm run voice-server
   ```
   Or: `cd voice-backend && npm start` (requires `ELEVENLABS_API_KEY` in `.env`)

2. **Open the app** (web or Expo)
   ```bash
   npm run web
   ```

3. **Use the demo**
   - On Welcome, tap **"Try Voice Clone Demo (no Firebase)"**
   - Record 20–30 seconds of voice
   - Create clone
   - Type a message and press "Generate & Play"

4. **Demo mode for login** (when Firebase isn't working)
   - Set `EXPO_PUBLIC_DEMO_MODE=true` in `.env` or app config
   - Caregiver Sign In proceeds to dashboard without Firebase
   - Registration completes and shows access key (DEMO-XX if Firebase is offline)

---

## What’s Done

### Caregiver registration (multi-step)
- **Step 1:** Name, email, password, elderly person’s name, 30-second voice sample
- **Step 2:** Emergency contacts (name, phone)
- **Step 3:** Notification sounds (regular chime + emergency sound)
- **Step 4:** Setup complete with access key

### Caregiver sign in
- Email + password
- Demo mode: skips Firebase and goes to dashboard

### Dashboard
- Elder’s name shown (“Caring for: [Name]”)
- Create reminder button
- Today’s reminders with status: Done, Not Answered, Pending

### Create reminder
- Reminder title
- Type: Video, Voice clone
- Schedule: once, daily, weekly, monthly
- Date & time (via SchedulePicker)
- Importance: Important, Normal
- Timeframe: minutes before emergency contacts are notified
- Optional task information (text)
- Optional medicine link (from medications)
- Save reminder

### Voice cloning
- Voice sample at registration → ElevenLabs clone → `voiceId` stored
- Voice reminder: caregiver types text → TTS with cloned voice → audio stored as reminder

### Elderly side
- Access key sign-in (one-time setup)
- Start Task button
- Video/audio plays
- Caregiver’s message displayed
- Done button
- Emergency escalation (Cloud Function when no response in timeframe)

---

## Remaining Tasks

### 1. Firebase / Cloud Functions
- [ ] Deploy `validateElderlyKey` (elderly login)
- [ ] Configure Firebase (env vars, rules)
- [ ] Verify `sendScheduledReminders` and `checkEscalations`

### 2. Sound database
- [ ] Add 10 sounds (from the web) to backend/storage
- [ ] Wire SoundPickerScreen to real sound files
- [ ] Different alarms for important vs emergency

### 3. Medicine images
- [ ] Image picker in Create Reminder
- [ ] Upload to Storage, store URL on reminder
- [ ] Show in ElderlyReminderScreen

### 4. Notifications on elderly phone
- [ ] FCM notifications at scheduled time
- [ ] Different sounds for important vs emergency
- [ ] Deep link to reminder when tapped

### 5. UI polish
- [ ] Match Remember Me UI (colors, typography, layout)
- [ ] Accessibility (labels, contrast)
- [ ] Loading and error states

### 6. “Audio” reminder type
- [ ] Optional third type: record audio (separate from voice clone)
- [ ] If needed: Record → upload → attach to reminder

---

## Configuration

| Env variable | Purpose |
|-------------|---------|
| `EXPO_PUBLIC_VOICE_API_URL` | Voice backend URL (default: `http://localhost:3001`) |
| `EXPO_PUBLIC_DEMO_MODE` | `true` to skip Firebase (for demos when Firebase isn't working) |
| `ELEVENLABS_API_KEY` | In `voice-backend/.env` for voice cloning |
