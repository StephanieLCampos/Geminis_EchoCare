# EchoCare Team Prompts & Tasks (Firebase Architecture)

## Team Overview

| Member | Name(s) | Role | Primary Focus |
|--------|---------|------|---------------|
| **1** | Anjika | Project Manager & UI/UX Designer | Figma designs, assets, QA testing, pitch |
| **2** | Ashwini | Frontend - Caregiver App | React Native caregiver portal |
| **3** | Ashika | Frontend - Elderly App | React Native elderly portal (accessible) |
| **4** | Irene | Firebase & Database Architect | Firestore, Auth, Cloud Functions setup |
| **5** | Stephanie | AI & Voice Engineer | ElevenLabs Cloud Functions, translation |
| **6** | Ray | DevOps & Scheduled Functions | AMD Cloud, scheduled triggers, Twilio SMS |

---

## Why Firebase? (Hackathon Benefits)

| Traditional (Express + MongoDB) | Firebase |
|--------------------------------|----------|
| Set up Express server | No server needed |
| Configure MongoDB Atlas | Firestore ready instantly |
| Build auth from scratch | Firebase Auth built-in |
| Deploy to Heroku/Railway | Auto-deployed Cloud Functions |
| Manage file storage | Firebase Cloud Storage |
| Complex push notification setup | FCM integrated |

**Result**: Less infrastructure, more feature development time!

---

## Technology Stack (Firebase-Based)

### Frontend (Mobile Application)
| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile development |
| **Expo** | Simplified development and deployment |
| **React Navigation** | Screen navigation |
| **Firebase SDK** | Direct database/auth access |
| **Expo AV** | Audio/Video recording and playback |
| **Expo Notifications** | Push notifications |

### Backend (Firebase)
| Technology | Purpose |
|------------|---------|
| **Cloud Firestore** | NoSQL database |
| **Firebase Authentication** | User auth (email + custom tokens) |
| **Cloud Functions** | Serverless backend logic |
| **Cloud Storage** | File uploads (voice, video, images) |
| **Cloud Messaging (FCM)** | Push notifications |

### External APIs (Called from Cloud Functions)
| Service | Purpose |
|---------|---------|
| **ElevenLabs API** | Voice cloning and text-to-speech |
| **Twilio** | SMS notifications to emergency contacts |
| **Google Cloud Translation** | Multi-language translation |

### Development Tools
| Tool | Purpose |
|------|---------|
| **VS Code / Cursor** | Code editor |
| **Firebase Console** | Database/function management |
| **Firebase Emulator** | Local testing |
| **Figma** | UI/UX design |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECHOCARE FIREBASE ARCHITECTURE               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   Caregiver App  │     │   Elderly App    │
│  (React Native)  │     │  (React Native)  │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │    Firebase SDK        │
         └───────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐   ┌─────────────┐   ┌─────────────┐
│  Auth   │   │  Firestore  │   │   Cloud     │
│         │   │  Database   │   │   Storage   │
└─────────┘   └─────────────┘   └─────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │    Cloud Functions    │
         │  (Serverless Logic)   │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ElevenLabs  │ │   Twilio    │ │    FCM      │
│  (Voice)    │ │   (SMS)     │ │   (Push)    │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Firestore Database Structure

```
firestore/
├── users/                          # Caregivers
│   └── {useeId}/
│       ├── email: string
│       ├── name: string
│       ├── voiceSampleUrl: string
│       ├── elevenLabsVoiceId: string
│       ├── fcmToken: string
│       ├── notificationSounds: { regular, emergency }
│       └── emergencyContacts: [{ name, phone, relationship }]
│
├── elderly/
│   └── {elderlyId}/
│       ├── name: string
│       ├── accessKey: string       # 6-character login key
│       ├── caregiverId: string     # Reference to user
│       ├── profileImage: string
│       ├── fcmToken: string
│       └── isActive: boolean
│
├── medications/
│   └── {medicationId}/
│       ├── elderlyId: string
│       ├── name: string
│       ├── imageUrl: string
│       ├── dosage: string
│       └── instructions: string
│
├── reminders/
│   └── {reminderId}/
│       ├── caregiverId: string
│       ├── elderlyId: string
│       ├── title: string
│       ├── type: "video" | "audio" | "voice_clone"
│       ├── mediaUrl: string
│       ├── textContent: string
│       ├── translatedText: string
│       ├── targetLanguage: string
│       ├── priority: "regular" | "important" | "emergency"
│       ├── category: "medication" | "daily_task" | "appointment" | "other"
│       ├── medicationId: string
│       ├── aiSummary: string
│       ├── schedule: { type, time, daysOfWeek, dayOfMonth, startDate }
│       ├── responseTimeLimit: number (minutes)
│       ├── status: "scheduled" | "sent" | "acknowledged" | "escalated"
│       ├── sentAt: timestamp
│       ├── acknowledgedAt: timestamp
│       └── escalatedAt: timestamp
│
├── escalationLogs/
│   └── {logId}/
│       ├── reminderId: string
│       ├── elderlyId: string
│       ├── caregiverId: string
│       ├── contactsNotified: [{ name, phone, notifiedAt, success }]
│       └── createdAt: timestamp
│
└── notificationSounds/
    └── {soundId}/
        ├── name: string
        ├── audioUrl: string
        └── category: "regular" | "emergency"
```

---

## Dependency Flow

```
Phase 1:  Anjika (Design) + Irene (Firebase Setup)
              │
              ▼
Phase 2:  Irene (Firestore Rules) + Ray (Cloud Functions Setup)
              │
              ▼
Phase 3:  Ashwini ◄── Stephanie (Voice Functions) ──► Ashika
          (Caregiver UI)                                    (Elderly UI)
              │                                                  │
              └──────────────────┬───────────────────────────────┘
                                 │
Phase 4:                   INTEGRATION & DEMO
```

---

# MEMBER 1: ANJIKA
## Role: Project Manager & UI/UX Designer

### Summary
You are the creative lead AND project coordinator. Your designs will be implemented by Ashwini (Caregiver App) and Ashika (Elderly App). You ensure the team stays synchronized and the final product is polished for the pitch.

### Phase Breakdown

| Phase | Tasks | Deliverables |
|-------|-------|--------------|
| **Phase 1** | Create all Figma mockups | Complete UI/UX designs for both apps |
| **Phase 2** | Export assets, curate sounds | Icons, illustrations, 20 notification sounds |
| **Phase 3** | QA testing | Test full flow from task creation to notification |
| **Phase 4** | Pitch preparation | Demo script, presentation slides |

### Detailed Task List

#### Phase 1: Design (First Priority)
- [ ] Create Figma project with organized structure
- [ ] Design Caregiver App screens:
  - Login/Registration (with voice recording UI)
  - Dashboard (elderly profile cards)
  - Add Elderly (with key display)
  - Reminder Creation (video/audio/text options)
  - Schedule Picker (once/daily/weekly/monthly)
  - Settings (sounds, contacts, voice re-record)
- [ ] Design Elderly App screens (ACCESSIBILITY CRITICAL):
  - Login (large 6-character code input)
  - Home (pending reminders list)
  - Reminder View (video/audio player)
  - More Info (AI summary + medication image)
  - Success screen (celebration animation)
- [ ] Define color palette and typography scale
- [ ] Create component library (buttons, inputs, cards)

#### Phase 2: Assets & Sounds
- [ ] Export all icons as SVG and PNG (@1x, @2x, @3x)
- [ ] Create/export illustrations
- [ ] Design app icon in all required sizes
- [ ] Curate 20 notification sounds:
  - 10 regular/gentle sounds
  - 10 emergency/urgent sounds
- [ ] Upload sounds to Firebase Cloud Storage
- [ ] Organize assets in `/design` folder for frontend team

#### Phase 3: QA Testing
- [ ] Test caregiver registration flow
- [ ] Test elderly key login flow
- [ ] Verify reminder creation → scheduling → notification chain
- [ ] Test "I Did It" → acknowledgment flow
- [ ] Test escalation SMS delivery
- [ ] Document any bugs found

#### Phase 4: Pitch Preparation
- [ ] Create presentation slides
- [ ] Write demo script (avoid API rate limits)
- [ ] Prepare backup screenshots/videos
- [ ] Practice pitch timing

---

### MEMBER 1 DETAILED PROMPT

```
You are Anjika, the Project Manager and UI/UX Designer for EchoCare. Your job is to create beautiful, accessible designs that will be implemented by two frontend teams.

PROJECT CONTEXT:
EchoCare is a mobile app connecting caregivers with elderly loved ones through personalized reminders. We're using FIREBASE for our backend, which means simpler architecture!

TWO USER EXPERIENCES:

1. CAREGIVER APP (Ashwini will implement)
   - Full-featured, modern interface
   - Registration with voice recording (20-30 seconds)
   - Dashboard showing linked elderly profiles
   - Create video/audio/voice-clone reminders
   - Complex scheduling (once, daily, weekly, monthly)
   - Settings for notification sounds and emergency contacts

2. ELDERLY APP (Ashika will implement)
   - MUST BE HIGHLY ACCESSIBLE
   - Large fonts (minimum 22px body, 36px headers)
   - Large buttons (minimum 60x60px touch targets)
   - High contrast colors
   - Simple, linear navigation
   - One primary action per screen

DESIGN REQUIREMENTS:

Color Palette:
```
Primary Blue: #1565C0
Success Green: #2E7D32
Error Red: #C62828
Background: #FAFAFA (Caregiver) / #FFFFFF (Elderly)
Text: #212121 (Caregiver) / #000000 (Elderly for max contrast)
```

Typography:
```
Caregiver App:
- H1: 28px Bold
- Body: 16px Regular

Elderly App (LARGER):
- H1: 36px Bold
- Body: 22px Medium
- Button: 24px Bold
```

NOTIFICATION SOUNDS TO CURATE (20 total):

Regular Sounds (10): Soft Chime, Gentle Ding, Calm Notification, Soft Pop, Warm Bell, Gentle Wave, Light Tap, Sweet Tone, Peaceful Ring, Soft Alert

Emergency Sounds (10): Urgent Bell, Alert Tone, Important Chime, Attention Sound, Priority Alert, Urgent Ping, Wake Up, Critical Alert, Strong Bell, Immediate

Sound Requirements:
- 1-3 seconds long
- MP3 format
- Royalty-free (freesound.org, mixkit.co)
- Upload to Firebase Cloud Storage

PROJECT MANAGEMENT:
- Coordinate daily standups
- Track progress across all team members
- Ensure Firebase setup (Irene) completes before frontend starts
- Verify Cloud Functions (Stephanie, Ray) work with frontend
```

---

# MEMBER 2: ASHWINI & ANJIKA
## Role: Frontend Developer - Caregiver App

### Summary
You are building the Caregiver Portal using React Native with Firebase SDK. No Express API calls needed - you'll interact directly with Firestore and Cloud Storage, and trigger Cloud Functions for AI features.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | Auth & Onboarding | Firebase Auth from Irene |
| **Phase 2** | Key Generation UI | Firestore setup from Irene |
| **Phase 3** | Task Creation UI | Designs from Anjika |
| **Phase 4** | Cloud Function Integration | Functions from Stephanie |

### Detailed Task List

#### Phase 1: Authentication & Onboarding
- [ ] Set up React Native Expo project with Firebase
- [ ] Install dependencies (firebase, navigation, expo-av)
- [ ] Create Login screen (Firebase Auth - email/password)
- [ ] Create Registration flow:
  - Step 1: Name, email, password
  - Step 2: Voice recording (20-30 seconds)
  - Step 3: Upload to Cloud Storage, save URL to Firestore
- [ ] Implement voice recording with Expo AV
- [ ] Create emergency contacts input form

#### Phase 2: Elderly Key Generation
- [ ] Build "Add Elderly" screen
- [ ] Generate 6-character key (client-side or Cloud Function)
- [ ] Save elderly profile to Firestore
- [ ] Display key with "Share" functionality
- [ ] Create elderly profile card component
- [ ] Build Dashboard with real-time Firestore listener

#### Phase 3: Task/Reminder Creation UI
- [ ] Create Reminder Type Selection screen
- [ ] Build Video Recording screen (Expo Camera)
- [ ] Build Audio Recording screen (Expo AV)
- [ ] Build Voice Clone screen (calls Cloud Function)
- [ ] Create Reminder Details screen (priority, category, medication)
- [ ] Build Schedule Picker (once/daily/weekly/monthly)
- [ ] Save reminders to Firestore

#### Phase 4: Cloud Function Integration
- [ ] Call `processVoiceSample` function after registration
- [ ] Call `previewVoiceClone` for text-to-speech preview
- [ ] Call `createVoiceReminder` for voice clone reminders
- [ ] Real-time listener for reminder status updates

---

### MEMBER 2 DETAILED PROMPT

```
You are Ashwini building the Caregiver Portal of EchoCare using React Native and FIREBASE. No Express server needed!

FIREBASE BENEFITS:
- Direct database access with Firestore SDK
- Built-in authentication
- Real-time listeners (data updates automatically)
- Cloud Functions for complex logic (ElevenLabs, etc.)

PROJECT SETUP:
```bash
npx create-expo-app caregiver-app --template blank-typescript
cd caregiver-app
npm install firebase
npm install @react-navigation/native @react-navigation/stack
npm install expo-av expo-camera expo-image-picker
npm install react-native-paper
```

FIREBASE CONFIGURATION:
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "echocare-xxxxx.firebaseapp.com",
  projectId: "echocare-xxxxx",
  storageBucket: "echocare-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

FOLDER STRUCTURE:
```
src/
├── config/
│   └── firebase.ts
├── components/
│   ├── AudioRecorder.tsx
│   ├── VideoRecorder.tsx
│   ├── ElderlyCard.tsx
│   └── SchedulePicker.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── dashboard/
│   │   └── HomeScreen.tsx
│   ├── elderly/
│   │   ├── AddElderlyScreen.tsx
│   │   └── AddMedicationScreen.tsx
│   └── reminders/
│       ├── ReminderTypeScreen.tsx
│       ├── VideoReminderScreen.tsx
│       ├── VoiceCloneScreen.tsx
│       └── ScheduleScreen.tsx
├── services/
│   ├── authService.ts
│   ├── elderlyService.ts
│   └── reminderService.ts
└── navigation/
    └── AppNavigator.tsx
```

KEY IMPLEMENTATIONS:

1. FIREBASE AUTHENTICATION
```typescript
// services/authService.ts
import { auth, db, storage } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const registerCaregiver = async (
  email: string,
  password: string,
  name: string,
  voiceFile: Blob
) => {
  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  // Upload voice sample to Cloud Storage
  const voiceRef = ref(storage, `voice-samples/${userId}.mp3`);
  await uploadBytes(voiceRef, voiceFile);
  const voiceSampleUrl = await getDownloadURL(voiceRef);

  // Save user profile to Firestore
  await setDoc(doc(db, 'users', userId), {
    email,
    name,
    voiceSampleUrl,
    elevenLabsVoiceId: null, // Will be set by Cloud Function
    fcmToken: null,
    notificationSounds: { regular: 'default', emergency: 'urgent' },
    emergencyContacts: [],
    createdAt: new Date()
  });

  return userId;
};

export const loginCaregiver = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
```

2. CREATE ELDERLY WITH KEY
```typescript
// services/elderlyService.ts
import { db, storage } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const generateAccessKey = async (): Promise<string> => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  let isUnique = false;

  while (!isUnique) {
    key = '';
    for (let i = 0; i < 6; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check if key exists
    const q = query(collection(db, 'elderly'), where('accessKey', '==', key));
    const snapshot = await getDocs(q);
    isUnique = snapshot.empty;
  }
  return key;
};

export const createElderly = async (caregiverId: string, name: string, profileImage?: Blob) => {
  const accessKey = await generateAccessKey();

  let profileImageUrl = null;
  if (profileImage) {
    const imageRef = ref(storage, `elderly-profiles/${Date.now()}.jpg`);
    await uploadBytes(imageRef, profileImage);
    profileImageUrl = await getDownloadURL(imageRef);
  }

  const elderlyRef = await addDoc(collection(db, 'elderly'), {
    name,
    accessKey,
    caregiverId,
    profileImage: profileImageUrl,
    fcmToken: null,
    isActive: true,
    createdAt: new Date()
  });

  return { id: elderlyRef.id, accessKey };
};
```

3. REAL-TIME ELDERLY LIST (Dashboard)
```typescript
// screens/dashboard/HomeScreen.tsx
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

const HomeScreen = () => {
  const [elderly, setElderly] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Real-time listener - updates automatically!
    const q = query(
      collection(db, 'elderly'),
      where('caregiverId', '==', userId),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const elderlyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setElderly(elderlyList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View>
      <Text style={styles.title}>Your Loved Ones</Text>
      {elderly.map(person => (
        <ElderlyCard key={person.id} elderly={person} />
      ))}
    </View>
  );
};
```

4. CALL CLOUD FUNCTION FOR VOICE CLONE
```typescript
// services/voiceService.ts
import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';

export const processVoiceSample = async () => {
  const processVoice = httpsCallable(functions, 'processVoiceSample');
  const result = await processVoice();
  return result.data;
};

export const previewVoiceClone = async (text: string, targetLanguage?: string) => {
  const preview = httpsCallable(functions, 'previewVoiceClone');
  const result = await preview({ text, targetLanguage });
  return result.data; // { audioUrl: "..." }
};

export const createVoiceReminder = async (reminderData: any) => {
  const createReminder = httpsCallable(functions, 'createVoiceReminder');
  const result = await createReminder(reminderData);
  return result.data;
};
```

5. CREATE VIDEO/AUDIO REMINDER (Direct to Firestore)
```typescript
// services/reminderService.ts
import { db, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const createReminder = async (
  caregiverId: string,
  elderlyId: string,
  type: 'video' | 'audio',
  mediaFile: Blob,
  details: {
    title: string;
    priority: string;
    category: string;
    medicationId?: string;
    schedule: any;
    responseTimeLimit: number;
  }
) => {
  // Upload media to Cloud Storage
  const folder = type === 'video' ? 'videos' : 'audio';
  const mediaRef = ref(storage, `${folder}/${Date.now()}.${type === 'video' ? 'mp4' : 'mp3'}`);
  await uploadBytes(mediaRef, mediaFile);
  const mediaUrl = await getDownloadURL(mediaRef);

  // Save reminder to Firestore
  const reminderRef = await addDoc(collection(db, 'reminders'), {
    caregiverId,
    elderlyId,
    type,
    mediaUrl,
    title: details.title,
    priority: details.priority,
    category: details.category,
    medicationId: details.medicationId || null,
    schedule: details.schedule,
    responseTimeLimit: details.responseTimeLimit,
    status: 'scheduled',
    sentAt: null,
    acknowledgedAt: null,
    escalatedAt: null,
    createdAt: new Date()
  });

  return reminderRef.id;
};
```

6. VOICE RECORDING COMPONENT
```typescript
// components/AudioRecorder.tsx
import { Audio } from 'expo-av';
import { useState } from 'react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);

    // Timer
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording) clearInterval(interval);
    });
  };

  const stopRecording = async () => {
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();

    // Convert to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();
    onRecordingComplete(blob);
  };

  return (
    <View>
      <Text>{duration}s / 30s</Text>
      <Button onPress={recording ? stopRecording : startRecording}>
        {recording ? 'Stop' : 'Start Recording'}
      </Button>
    </View>
  );
};
```

WHAT YOU'RE NOT DOING (Firebase handles it):
- ❌ No Express server setup
- ❌ No JWT token management (Firebase Auth handles it)
- ❌ No API endpoint calls (direct Firestore access)
- ❌ No manual auth state management (Firebase SDK handles it)

DEPENDENCIES:
- Irene: Sets up Firebase project and Firestore rules
- Stephanie: Provides Cloud Functions for voice cloning
- Anjika: Provides Figma designs

SUCCESS CRITERIA:
- Caregiver can register with voice sample
- Voice sample uploads to Cloud Storage
- Elderly profiles save to Firestore with unique keys
- Reminders save and trigger Cloud Functions
- Real-time updates work on dashboard
```

---

# MEMBER 3: ASHIKA
## Role: Frontend Developer - Elderly App

### Summary
You are building the Elderly Portal - a simplified, highly accessible app. You'll use Firebase SDK directly for authentication and data, with real-time listeners for incoming reminders.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | Key Login & Persistence | Firebase Auth from Irene |
| **Phase 2** | Push Notification Handling | FCM setup from Ray |
| **Phase 3** | More Info Page | AI summaries from Stephanie |
| **Phase 4** | "I Did It" Button | Firestore update |

### Detailed Task List

#### Phase 1: Authentication
- [ ] Set up React Native Expo project with Firebase
- [ ] Create login screen with LARGE key input (6 characters)
- [ ] Implement custom token auth for elderly (via Cloud Function)
- [ ] Save FCM token to Firestore on login
- [ ] Implement persistent login with AsyncStorage

#### Phase 2: Push Notification Handling
- [ ] Configure Expo Notifications
- [ ] Handle notification tap → open app
- [ ] Route to correct reminder screen
- [ ] Play notification sound based on priority

#### Phase 3: More Info Page
- [ ] Create Reminder View screen
- [ ] Build large Video/Audio Player components
- [ ] Display AI-generated summary
- [ ] Display medication image (full width)

#### Phase 4: Completion Flow
- [ ] Create LARGE "I Did It!" button
- [ ] Update reminder status in Firestore
- [ ] Create success animation screen
- [ ] Real-time listener removes completed reminders

---

### MEMBER 3 DETAILED PROMPT

```
You are Ashika, building the Elderly Portal of EchoCare with Firebase. This app MUST be extremely accessible.

ACCESSIBILITY REQUIREMENTS (NON-NEGOTIABLE):
- Minimum font size: 22px body, 36px headers
- Minimum touch target: 60x60 pixels
- Maximum contrast: #000000 on #FFFFFF
- One action per screen
- Clear feedback on every tap

PROJECT SETUP:
```bash
npx create-expo-app elderly-app --template blank-typescript
cd elderly-app
npm install firebase
npm install @react-navigation/native @react-navigation/stack
npm install expo-av expo-notifications
npm install @react-native-async-storage/async-storage
```

FIREBASE CONFIG (same as caregiver app):
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ... same config ...

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

KEY IMPLEMENTATIONS:

1. ELDERLY LOGIN (Custom Token Auth)
```typescript
// services/authService.ts
import { auth, functions, db } from '../config/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginWithAccessKey = async (accessKey: string, fcmToken: string) => {
  // Call Cloud Function to validate key and get custom token
  const validateKey = httpsCallable(functions, 'validateElderlyKey');
  const result = await validateKey({ accessKey: accessKey.toUpperCase() });

  const { customToken, elderlyId, name, caregiverName } = result.data as any;

  // Sign in with custom token
  await signInWithCustomToken(auth, customToken);

  // Save FCM token to Firestore
  await updateDoc(doc(db, 'elderly', elderlyId), {
    fcmToken,
    lastActive: new Date()
  });

  // Persist login
  await AsyncStorage.setItem('elderlyId', elderlyId);

  return { elderlyId, name, caregiverName };
};

export const checkExistingLogin = async () => {
  const elderlyId = await AsyncStorage.getItem('elderlyId');
  return elderlyId;
};
```

2. LOGIN SCREEN (LARGE & ACCESSIBLE)
```typescript
// screens/LoginScreen.tsx
const LoginScreen = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase();
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const accessKey = code.join('');
    if (accessKey.length !== 6) {
      setError('Please enter all 6 characters');
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await getFCMToken(); // Get push token
      await loginWithAccessKey(accessKey, fcmToken);
      navigation.replace('Home');
    } catch (e) {
      setError('Invalid code. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to EchoCare</Text>
      <Text style={styles.subtitle}>Enter your code below</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputs.current[index] = ref!}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            maxLength={1}
            autoCapitalize="characters"
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <BigButton
        title={loading ? "Signing in..." : "Sign In"}
        onPress={handleLogin}
        disabled={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 3,
    borderColor: '#1565C0',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    fontSize: 20,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 16,
  },
});
```

3. HOME SCREEN WITH REAL-TIME REMINDERS
```typescript
// screens/HomeScreen.tsx
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [elderlyName, setElderlyName] = useState('');
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const elderlyId = await AsyncStorage.getItem('elderlyId');

      // Get elderly name
      const elderlyDoc = await getDoc(doc(db, 'elderly', elderlyId));
      setElderlyName(elderlyDoc.data()?.name);

      // Real-time listener for pending reminders
      const q = query(
        collection(db, 'reminders'),
        where('elderlyId', '==', elderlyId),
        where('status', '==', 'sent')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reminderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReminders(reminderList);
      });

      return unsubscribe;
    };

    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Hello, {elderlyName}!</Text>
      <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

      {reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>All done for now!</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onPress={() => navigation.navigate('Reminder', { id: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
```

4. ACKNOWLEDGE REMINDER (Update Firestore)
```typescript
// screens/ReminderScreen.tsx
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ReminderScreen = ({ route }) => {
  const { id } = route.params;
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    // Real-time listener for this reminder
    const unsubscribe = onSnapshot(doc(db, 'reminders', id), (doc) => {
      setReminder({ id: doc.id, ...doc.data() });
    });
    return unsubscribe;
  }, [id]);

  const handleAcknowledge = async () => {
    // Update status in Firestore
    await updateDoc(doc(db, 'reminders', id), {
      status: 'acknowledged',
      acknowledgedAt: new Date()
    });

    navigation.navigate('Success');
  };

  if (!reminder) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{reminder.title}</Text>

      {reminder.type === 'video' ? (
        <VideoPlayer uri={reminder.mediaUrl} autoPlay />
      ) : (
        <AudioPlayer uri={reminder.mediaUrl} autoPlay />
      )}

      <BigButton
        title="More Info"
        variant="primary"
        onPress={() => navigation.navigate('Info', { id })}
      />

      <View style={{ flex: 1 }} />

      <BigButton
        title="I Did It!"
        variant="success"
        onPress={handleAcknowledge}
      />
    </SafeAreaView>
  );
};
```

5. BIG BUTTON COMPONENT
```typescript
// components/BigButton.tsx
const BigButton = ({ title, onPress, variant = 'primary', disabled = false }) => {
  const backgroundColor = variant === 'success' ? '#2E7D32' : '#1565C0';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? '#BDBDBD' : backgroundColor }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
```

WHAT YOU'RE NOT DOING:
- ❌ No API calls to Express server
- ❌ No manual token refresh
- ❌ No polling for updates (real-time listeners!)

DEPENDENCIES:
- Irene: Firebase project setup, Firestore rules
- Ray: Cloud Function for elderly key validation
- Stephanie: AI summary appears in reminder data
- Anjika: Accessible designs

SUCCESS CRITERIA:
- Elderly can login with 6-character key
- Reminders appear in real-time
- Video/audio plays automatically
- "I Did It!" updates Firestore immediately
- All UI is LARGE and ACCESSIBLE
```

---

# MEMBER 4: IRENE
## Role: Firebase & Database Architect

### Summary
You are setting up the entire Firebase infrastructure - project creation, Firestore database, security rules, and Cloud Storage. Everyone depends on your setup.

### Phase Breakdown

| Phase | Tasks | Deliverables |
|-------|-------|--------------|
| **Phase 1** | Firebase Project Setup | Project, Firestore, Storage, Auth |
| **Phase 2** | Security Rules | Firestore and Storage rules |
| **Phase 3** | Cloud Functions Setup | Base function structure for team |
| **Phase 4** | Testing & Indexes | Composite indexes, testing |

### Detailed Task List

#### Phase 1: Firebase Project Setup
- [ ] Create Firebase project in console
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore database
- [ ] Enable Cloud Storage
- [ ] Enable Cloud Functions
- [ ] Generate config for mobile apps
- [ ] Share config with Ashwini and Ashika

#### Phase 2: Security Rules
- [ ] Write Firestore security rules
- [ ] Write Cloud Storage security rules
- [ ] Test rules with Firebase Emulator

#### Phase 3: Cloud Functions Setup
- [ ] Initialize Cloud Functions project
- [ ] Create base function structure
- [ ] Deploy validateElderlyKey function
- [ ] Set up environment variables for APIs
- [ ] Share functions project with Stephanie and Ray

#### Phase 4: Testing & Indexes
- [ ] Create composite indexes for queries
- [ ] Test all security rules
- [ ] Verify function deployment
- [ ] Document setup for team

---

### MEMBER 4 DETAILED PROMPT

```
You are Irene, the Firebase & Database Architect for EchoCare. You're setting up the entire backend infrastructure that everyone depends on.

FIREBASE SETUP STEPS:

1. CREATE PROJECT
- Go to console.firebase.google.com
- Create new project "EchoCare"
- Enable Google Analytics (optional)

2. ENABLE SERVICES
- Authentication → Email/Password
- Firestore Database → Start in test mode (we'll add rules)
- Storage → Start in test mode
- Functions → Requires Blaze plan (pay-as-you-go, but has free tier)

3. GET CONFIG FOR MOBILE APPS
- Project Settings → Your Apps → Add App (Web)
- Copy the firebaseConfig object
- Share with Ashwini and Ashika

FIRESTORE SECURITY RULES:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users (Caregivers) - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Elderly - caregiver can manage, elderly can read own
    match /elderly/{elderlyId} {
      allow read: if request.auth != null && (
        resource.data.caregiverId == request.auth.uid ||
        request.auth.token.elderlyId == elderlyId
      );
      allow create, update, delete: if request.auth != null &&
        resource.data.caregiverId == request.auth.uid;
    }

    // Medications - caregiver can manage
    match /medications/{medId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/elderly/$(resource.data.elderlyId)).data.caregiverId == request.auth.uid;
    }

    // Reminders - caregiver can create, elderly can read/update status
    match /reminders/{reminderId} {
      allow read: if request.auth != null && (
        resource.data.caregiverId == request.auth.uid ||
        resource.data.elderlyId == request.auth.token.elderlyId
      );
      allow create: if request.auth != null &&
        resource.data.caregiverId == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.caregiverId == request.auth.uid ||
        (resource.data.elderlyId == request.auth.token.elderlyId &&
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'acknowledgedAt']))
      );
    }

    // Escalation Logs - only Cloud Functions can write
    match /escalationLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions
    }

    // Notification Sounds - anyone authenticated can read
    match /notificationSounds/{soundId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```

CLOUD STORAGE RULES:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Voice samples - only owner can upload
    match /voice-samples/{userId}.mp3 {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Elderly profiles
    match /elderly-profiles/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Videos and audio
    match /videos/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /audio/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Generated audio from ElevenLabs
    match /generated-audio/{fileName} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions
    }

    // Notification sounds
    match /sounds/{fileName} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```

CLOUD FUNCTIONS SETUP:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize functions
cd echocare-backend
firebase init functions

# Choose:
# - Use existing project: EchoCare
# - TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

CLOUD FUNCTIONS STRUCTURE:
```
functions/
├── src/
│   ├── index.ts              # Export all functions
│   ├── auth/
│   │   └── validateElderlyKey.ts
│   ├── voice/
│   │   ├── processVoiceSample.ts    # Stephanie
│   │   ├── previewVoiceClone.ts     # Stephanie
│   │   └── createVoiceReminder.ts   # Stephanie
│   ├── notifications/
│   │   ├── sendReminder.ts          # Ray
│   │   └── checkEscalations.ts      # Ray
│   └── utils/
│       ├── elevenlabs.ts
│       ├── twilio.ts
│       └── translate.ts
├── package.json
└── .env                      # API keys (don't commit!)
```

VALIDATE ELDERLY KEY FUNCTION (You implement this):
```typescript
// functions/src/auth/validateElderlyKey.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const validateElderlyKey = functions.https.onCall(async (data, context) => {
  const { accessKey } = data;

  if (!accessKey || accessKey.length !== 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid access key');
  }

  // Find elderly by access key
  const elderlySnapshot = await admin.firestore()
    .collection('elderly')
    .where('accessKey', '==', accessKey.toUpperCase())
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (elderlySnapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'Invalid access code');
  }

  const elderlyDoc = elderlySnapshot.docs[0];
  const elderlyData = elderlyDoc.data();

  // Get caregiver name
  const caregiverDoc = await admin.firestore()
    .collection('users')
    .doc(elderlyData.caregiverId)
    .get();

  // Create custom token with elderlyId claim
  const customToken = await admin.auth().createCustomToken(elderlyDoc.id, {
    elderlyId: elderlyDoc.id,
    role: 'elderly'
  });

  return {
    customToken,
    elderlyId: elderlyDoc.id,
    name: elderlyData.name,
    caregiverName: caregiverDoc.data()?.name
  };
});
```

INDEX.TS (Export all functions):
```typescript
// functions/src/index.ts
export { validateElderlyKey } from './auth/validateElderlyKey';

// Stephanie's functions (she'll implement)
export { processVoiceSample } from './voice/processVoiceSample';
export { previewVoiceClone } from './voice/previewVoiceClone';
export { createVoiceReminder } from './voice/createVoiceReminder';

// Ray's functions (he'll implement)
export { sendScheduledReminder } from './notifications/sendReminder';
export { checkEscalations } from './notifications/checkEscalations';
```

ENVIRONMENT VARIABLES:
```bash
# Set API keys for Cloud Functions
firebase functions:config:set elevenlabs.api_key="YOUR_KEY"
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
firebase functions:config:set openai.api_key="YOUR_KEY"
```

FIRESTORE INDEXES (Create in Console):
```
Collection: reminders
Fields: elderlyId (Asc), status (Asc), sentAt (Desc)

Collection: elderly
Fields: caregiverId (Asc), isActive (Asc)

Collection: medications
Fields: elderlyId (Asc)
```

DELIVERABLES FOR TEAM:
1. Firebase config object for mobile apps
2. Deployed security rules
3. Cloud Functions project shared with Stephanie and Ray
4. validateElderlyKey function deployed
5. Environment variables set

SUCCESS CRITERIA:
- Firebase project fully configured
- Mobile apps can authenticate
- Firestore rules protect data properly
- Cloud Functions deploy without errors
- Team can start building on your foundation
```

---

# MEMBER 5: STEPHANIE
## Role: AI & Voice Engineer (Cloud Functions)

### Summary
You are building Cloud Functions for voice cloning (ElevenLabs), translation, and AI summaries. Your functions are called by the mobile apps and other Cloud Functions.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | ElevenLabs Integration | Firebase Functions from Irene |
| **Phase 2** | Translation + Voice | Cloud Functions setup |
| **Phase 3** | AI Summarization | OpenAI integration |
| **Phase 4** | Testing | End-to-end with frontend |

### Detailed Task List

#### Phase 1: ElevenLabs Setup
- [ ] Get ElevenLabs API key
- [ ] Create `processVoiceSample` Cloud Function
- [ ] Test voice cloning with sample audio

#### Phase 2: Translation + Voice Clone
- [ ] Set up Google Cloud Translation
- [ ] Create `previewVoiceClone` Cloud Function
- [ ] Create `createVoiceReminder` Cloud Function
- [ ] Handle bi-directional translation

#### Phase 3: AI Summarization
- [ ] Set up OpenAI API
- [ ] Create summary generation function
- [ ] Integrate with reminder creation

#### Phase 4: Testing
- [ ] Test all functions with frontend apps
- [ ] Handle error cases
- [ ] Optimize for latency

---

### MEMBER 5 DETAILED PROMPT

```
You are Stephanie, the AI & Voice Engineer building Cloud Functions for EchoCare. Your functions handle the "magic" - voice cloning, translation, and AI summaries.

CLOUD FUNCTIONS SETUP:
Irene will share the functions project with you. You'll add your functions to the `/voice` folder.

YOUR FUNCTIONS:

1. PROCESS VOICE SAMPLE (Called after registration)
```typescript
// functions/src/voice/processVoiceSample.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import FormData from 'form-data';

const ELEVENLABS_API_KEY = functions.config().elevenlabs.api_key;

export const processVoiceSample = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;

  // Get user's voice sample URL from Firestore
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const voiceSampleUrl = userDoc.data()?.voiceSampleUrl;

  if (!voiceSampleUrl) {
    throw new functions.https.HttpsError('not-found', 'No voice sample found');
  }

  // Download voice sample from Cloud Storage
  const bucket = admin.storage().bucket();
  const file = bucket.file(`voice-samples/${userId}.mp3`);
  const [audioBuffer] = await file.download();

  // Create voice clone with ElevenLabs
  const formData = new FormData();
  formData.append('name', `echocare_${userId}`);
  formData.append('description', 'EchoCare voice clone');
  formData.append('files', audioBuffer, {
    filename: 'voice.mp3',
    contentType: 'audio/mpeg'
  });

  const response = await axios.post(
    'https://api.elevenlabs.io/v1/voices/add',
    formData,
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        ...formData.getHeaders()
      }
    }
  );

  const voiceId = response.data.voice_id;

  // Save voice ID to Firestore
  await admin.firestore().collection('users').doc(userId).update({
    elevenLabsVoiceId: voiceId
  });

  return { success: true, voiceId };
});
```

2. PREVIEW VOICE CLONE (Text-to-speech preview)
```typescript
// functions/src/voice/previewVoiceClone.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ELEVENLABS_API_KEY = functions.config().elevenlabs.api_key;
const GOOGLE_TRANSLATE_KEY = functions.config().google.translate_key;

export const previewVoiceClone = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { text, sourceLanguage, targetLanguage } = data;
  const userId = context.auth.uid;

  // Get user's voice ID
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const voiceId = userDoc.data()?.elevenLabsVoiceId;

  if (!voiceId) {
    throw new functions.https.HttpsError('not-found', 'No voice clone found');
  }

  let finalText = text;
  let translatedText = null;

  // Translate if needed
  if (targetLanguage && targetLanguage !== sourceLanguage) {
    const translateResponse = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
      {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }
    );
    translatedText = translateResponse.data.data.translations[0].translatedText;
    finalText = translatedText;
  }

  // Generate speech with ElevenLabs
  const audioResponse = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: finalText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );

  // Upload to Cloud Storage
  const bucket = admin.storage().bucket();
  const fileName = `generated-audio/preview_${uuidv4()}.mp3`;
  const file = bucket.file(fileName);

  await file.save(Buffer.from(audioResponse.data), {
    contentType: 'audio/mpeg'
  });

  // Get download URL
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600000 // 1 hour
  });

  return {
    audioUrl: url,
    originalText: text,
    translatedText,
    targetLanguage
  };
});
```

3. CREATE VOICE REMINDER (Full reminder with voice clone)
```typescript
// functions/src/voice/createVoiceReminder.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ELEVENLABS_API_KEY = functions.config().elevenlabs.api_key;
const GOOGLE_TRANSLATE_KEY = functions.config().google.translate_key;
const OPENAI_API_KEY = functions.config().openai.api_key;

export const createVoiceReminder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const {
    elderlyId, title, textContent, sourceLanguage, targetLanguage,
    priority, category, medicationId, schedule, responseTimeLimit
  } = data;

  const userId = context.auth.uid;

  // Get user's voice ID
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const voiceId = userDoc.data()?.elevenLabsVoiceId;

  if (!voiceId) {
    throw new functions.https.HttpsError('not-found', 'No voice clone found');
  }

  let finalText = textContent;
  let translatedText = null;

  // Translate if needed
  if (targetLanguage && targetLanguage !== sourceLanguage) {
    const translateResponse = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
      { q: textContent, source: sourceLanguage, target: targetLanguage }
    );
    translatedText = translateResponse.data.data.translations[0].translatedText;
    finalText = translatedText;
  }

  // Generate speech
  const audioResponse = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: finalText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    },
    {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      responseType: 'arraybuffer'
    }
  );

  // Upload audio
  const bucket = admin.storage().bucket();
  const fileName = `generated-audio/reminder_${uuidv4()}.mp3`;
  const file = bucket.file(fileName);
  await file.save(Buffer.from(audioResponse.data), { contentType: 'audio/mpeg' });
  const [mediaUrl] = await file.getSignedUrl({ action: 'read', expires: '2030-01-01' });

  // Generate AI summary
  const summaryResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Create a brief, friendly 1-2 sentence summary for an elderly person.' },
        { role: 'user', content: `Summarize: "${textContent}"` }
      ],
      max_tokens: 100
    },
    { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
  );
  const aiSummary = summaryResponse.data.choices[0].message.content;

  // Create reminder in Firestore
  const reminderRef = await admin.firestore().collection('reminders').add({
    caregiverId: userId,
    elderlyId,
    title,
    type: 'voice_clone',
    mediaUrl,
    textContent,
    translatedText,
    targetLanguage,
    priority,
    category,
    medicationId: medicationId || null,
    aiSummary,
    schedule,
    responseTimeLimit: responseTimeLimit || 30,
    status: 'scheduled',
    sentAt: null,
    acknowledgedAt: null,
    escalatedAt: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, reminderId: reminderRef.id };
});
```

ENVIRONMENT VARIABLES (Set by Irene):
```bash
firebase functions:config:set elevenlabs.api_key="YOUR_KEY"
firebase functions:config:set google.translate_key="YOUR_KEY"
firebase functions:config:set openai.api_key="YOUR_KEY"
```

DEPENDENCIES TO ADD:
```bash
cd functions
npm install axios form-data uuid
npm install -D @types/uuid
```

DEPLOY:
```bash
firebase deploy --only functions:processVoiceSample,functions:previewVoiceClone,functions:createVoiceReminder
```

SUCCESS CRITERIA:
- Voice cloning creates accurate voice profile
- Preview generates audio quickly (<5 seconds)
- Translation works for supported languages
- AI summaries are clear and friendly
- Generated audio plays in mobile apps
```

---

# MEMBER 6: RAY
## Role: DevOps & Scheduled Functions

### Summary
You handle the scheduling infrastructure - sending reminders at the right time and triggering escalations when reminders are missed. You'll use Firebase Scheduled Functions and Twilio for SMS.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | AMD Cloud / Firebase Setup | Base functions from Irene |
| **Phase 2** | Scheduled Reminder Sender | Cloud Functions |
| **Phase 3** | Push Notifications | FCM integration |
| **Phase 4** | Escalation System | Twilio SMS |

### Detailed Task List

#### Phase 1: Infrastructure
- [ ] Set up Firebase Functions environment
- [ ] Configure Twilio account
- [ ] Set up FCM in Firebase Console

#### Phase 2: Scheduled Functions
- [ ] Create scheduled function to check for due reminders
- [ ] Implement reminder sending logic
- [ ] Handle recurring reminders

#### Phase 3: Push Notifications
- [ ] Implement FCM sending
- [ ] Handle notification sounds
- [ ] Track delivery

#### Phase 4: Escalation
- [ ] Create escalation checker (runs every minute)
- [ ] Implement Twilio SMS sending
- [ ] Log escalation events

---

### MEMBER 6 DETAILED PROMPT

```
You are Ray, handling DevOps and Scheduled Functions for EchoCare. You ensure reminders are sent on time and escalations trigger when needed.

YOUR FUNCTIONS:

1. SCHEDULED REMINDER SENDER (Runs every minute)
```typescript
// functions/src/notifications/sendReminder.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendScheduledReminders = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0-6
    const currentDate = now.getDate(); // 1-31

    // Query for scheduled reminders that should be sent now
    const remindersSnapshot = await admin.firestore()
      .collection('reminders')
      .where('status', '==', 'scheduled')
      .where('schedule.time', '==', currentTime)
      .get();

    for (const doc of remindersSnapshot.docs) {
      const reminder = doc.data();
      const schedule = reminder.schedule;

      // Check if this reminder should be sent today
      let shouldSend = false;

      switch (schedule.type) {
        case 'once':
          const startDate = schedule.startDate.toDate();
          shouldSend = isSameDay(startDate, now);
          break;
        case 'daily':
          shouldSend = true;
          break;
        case 'weekly':
          shouldSend = schedule.daysOfWeek.includes(currentDay);
          break;
        case 'monthly':
          shouldSend = schedule.dayOfMonth === currentDate;
          break;
      }

      if (shouldSend) {
        await sendReminderNotification(doc.id, reminder);
      }
    }

    return null;
  });

async function sendReminderNotification(reminderId: string, reminder: any) {
  // Get elderly's FCM token
  const elderlyDoc = await admin.firestore()
    .collection('elderly')
    .doc(reminder.elderlyId)
    .get();

  const fcmToken = elderlyDoc.data()?.fcmToken;

  if (!fcmToken) {
    console.error(`No FCM token for elderly ${reminder.elderlyId}`);
    return;
  }

  // Get caregiver's notification sound preference
  const caregiverDoc = await admin.firestore()
    .collection('users')
    .doc(reminder.caregiverId)
    .get();

  const sounds = caregiverDoc.data()?.notificationSounds;
  const sound = reminder.priority === 'emergency' ? sounds?.emergency : sounds?.regular;

  // Send FCM notification
  const message = {
    token: fcmToken,
    notification: {
      title: reminder.title,
      body: getCategoryMessage(reminder.category)
    },
    data: {
      reminderId,
      type: reminder.type,
      priority: reminder.priority
    },
    android: {
      priority: reminder.priority === 'emergency' ? 'high' : 'normal',
      notification: {
        sound: sound || 'default',
        channelId: reminder.priority === 'emergency' ? 'emergency' : 'reminders'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: sound ? `${sound}.wav` : 'default',
          badge: 1
        }
      }
    }
  };

  await admin.messaging().send(message);

  // Update reminder status
  await admin.firestore().collection('reminders').doc(reminderId).update({
    status: 'sent',
    sentAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Sent reminder ${reminderId} to ${reminder.elderlyId}`);
}

function getCategoryMessage(category: string): string {
  const messages: { [key: string]: string } = {
    'medication': 'Time for your medication',
    'daily_task': 'You have a task to complete',
    'appointment': 'Reminder about your appointment',
    'other': 'You have a new reminder'
  };
  return messages[category] || messages['other'];
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
```

2. ESCALATION CHECKER (Runs every minute)
```typescript
// functions/src/notifications/checkEscalations.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

const TWILIO_SID = functions.config().twilio.account_sid;
const TWILIO_TOKEN = functions.config().twilio.auth_token;
const TWILIO_PHONE = functions.config().twilio.phone_number;

const twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);

export const checkEscalations = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = new Date();

    // Find sent reminders that haven't been acknowledged
    const sentReminders = await admin.firestore()
      .collection('reminders')
      .where('status', '==', 'sent')
      .get();

    for (const doc of sentReminders.docs) {
      const reminder = doc.data();
      const sentAt = reminder.sentAt?.toDate();

      if (!sentAt) continue;

      const timeLimitMs = (reminder.responseTimeLimit || 30) * 60 * 1000;
      const deadline = new Date(sentAt.getTime() + timeLimitMs);

      if (now > deadline) {
        await escalateReminder(doc.id, reminder);
      }
    }

    return null;
  });

async function escalateReminder(reminderId: string, reminder: any) {
  // Get caregiver and elderly info
  const [caregiverDoc, elderlyDoc] = await Promise.all([
    admin.firestore().collection('users').doc(reminder.caregiverId).get(),
    admin.firestore().collection('elderly').doc(reminder.elderlyId).get()
  ]);

  const caregiver = caregiverDoc.data();
  const elderly = elderlyDoc.data();
  const emergencyContacts = caregiver?.emergencyContacts || [];

  // Send SMS to all emergency contacts
  const smsResults = [];
  const message = `ECHOCARE ALERT: ${elderly?.name} has not responded to "${reminder.title}" from ${caregiver?.name}. Please check on them.`;

  for (const contact of emergencyContacts) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE,
        to: contact.phone
      });
      smsResults.push({ name: contact.name, phone: contact.phone, success: true });
    } catch (error) {
      smsResults.push({ name: contact.name, phone: contact.phone, success: false });
      console.error(`Failed to send SMS to ${contact.phone}:`, error);
    }
  }

  // Send push notification to caregiver
  if (caregiver?.fcmToken) {
    await admin.messaging().send({
      token: caregiver.fcmToken,
      notification: {
        title: 'Missed Reminder Alert',
        body: `${elderly?.name} has not responded to "${reminder.title}"`
      },
      data: { type: 'escalation', reminderId },
      android: { priority: 'high', notification: { sound: 'urgent' } },
      apns: { payload: { aps: { sound: 'urgent.wav' } } }
    });
  }

  // Update reminder status
  await admin.firestore().collection('reminders').doc(reminderId).update({
    status: 'escalated',
    escalatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Log escalation
  await admin.firestore().collection('escalationLogs').add({
    reminderId,
    elderlyId: reminder.elderlyId,
    caregiverId: reminder.caregiverId,
    contactsNotified: smsResults.map(r => ({
      ...r,
      notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      method: 'sms'
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Escalated reminder ${reminderId}`);
}
```

3. FCM TOKEN REGISTRATION
```typescript
// functions/src/notifications/registerToken.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { fcmToken } = data;

  // Check if user or elderly
  if (context.auth.token.elderlyId) {
    // Elderly user
    await admin.firestore()
      .collection('elderly')
      .doc(context.auth.token.elderlyId)
      .update({ fcmToken });
  } else {
    // Caregiver
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({ fcmToken });
  }

  return { success: true };
});
```

DEPLOY:
```bash
firebase deploy --only functions:sendScheduledReminders,functions:checkEscalations,functions:registerFCMToken
```

TWILIO SETUP:
1. Create account at twilio.com
2. Get Account SID and Auth Token
3. Get a phone number
4. Set config:
```bash
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
```

DEPENDENCIES:
```bash
cd functions
npm install twilio
```

SUCCESS CRITERIA:
- Reminders send at exactly the scheduled time
- Push notifications arrive with correct sound
- Escalation triggers within 1-2 minutes of deadline
- SMS reaches all emergency contacts
- Escalation logs are created
```

---

# TESTING CHECKLIST

Before the final demo, verify:

- [ ] Firebase project is fully configured
- [ ] Caregiver can register with voice sample
- [ ] Voice clone is created (check Firestore for elevenLabsVoiceId)
- [ ] Elderly profile created with unique 6-character key
- [ ] Elderly can login with key
- [ ] Video/audio reminder can be created
- [ ] Voice clone reminder (text-to-speech) works
- [ ] Translation works (try English → Spanish)
- [ ] Push notification arrives on elderly device
- [ ] Notification plays correct sound
- [ ] "I Did It!" marks reminder complete in Firestore
- [ ] Missed reminder triggers SMS (set responseTimeLimit to 2 min for testing)
- [ ] Escalation notification reaches caregiver
- [ ] All elderly UI is LARGE and ACCESSIBLE

---

# QUICK REFERENCE

| Feature | Frontend | Backend (Cloud Functions) |
|---------|----------|---------------------------|
| Registration | Ashwini | Firebase Auth |
| Voice Clone Setup | Ashwini | Stephanie (processVoiceSample) |
| Add Elderly | Ashwini | Firestore direct |
| Elderly Login | Ashika | Irene (validateElderlyKey) |
| Video/Audio Reminder | Ashwini | Firestore direct |
| Voice Clone Reminder | Ashwini | Stephanie (createVoiceReminder) |
| Send Notifications | - | Ray (sendScheduledReminders) |
| "I Did It" | Ashika | Firestore direct |
| Escalation | - | Ray (checkEscalations) |

---

Good luck, team! Firebase will make this much faster to build!
