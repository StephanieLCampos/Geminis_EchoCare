# EchoCare Elderly Portal (Frontend Role Scaffold)

This project is a React Native + Expo MVP for your role: the **Elderly Portal + linked onboarding flow**.

## What this includes

- 3-entry startup screen:
  - Create Account
  - Caregiver Portal Sign In
  - Elderly Sign In with Key
- Linked caregiver ↔ elderly setup with generated 6-character keys
- One-time login behavior using persisted local session (AsyncStorage)
- Support for one caregiver managing multiple elders (multiple keys)
- Initial setup fields:
  - caregiver name/email/password
  - elder name
  - ElevenLabs voice id (stored)
  - medication list
  - emergency contact
  - default basic + urgent audio profile IDs from catalog
- Caregiver reminder creation with required fields:
  - source type (video/tts/audio)
  - frequency
  - medication name (optional when relevant)
  - priority (basic/important/emergency)
  - response window before escalation
  - translation language (optional)
- Elderly reminder flow:
  - open reminder
  - tap **I Did It**
  - missed → escalated status logic
  - emergency contact displayed when escalated

## Run locally

1. Install dependencies

```bash
npm install
```

2. Start app

```bash
npm run start
```

3. Open in iOS simulator / Expo Go.

## Main files

- `src/navigation/AppNavigator.tsx`
- `src/store/appSlice.ts`
- `src/screens/CreateAccountScreen.tsx`
- `src/screens/CaregiverLoginScreen.tsx`
- `src/screens/ElderlyLoginScreen.tsx`
- `src/screens/CaregiverHomeScreen.tsx`
- `src/screens/SendReminderScreen.tsx`
- `src/screens/ElderlyHomeScreen.tsx`
- `src/screens/ReminderDetailScreen.tsx`

## Notes for backend integration

This scaffold is currently local-first for rapid demo. You can replace:

- auth and account creation → backend APIs
- key generation and lookup → backend services
- reminders and escalation checks → server + push jobs
- ElevenLabs voice clone/translation fields → real API payloads
- audio tone catalog IDs → backend-provided catalog
