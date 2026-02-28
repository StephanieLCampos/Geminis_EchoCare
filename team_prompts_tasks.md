# EchoCare Team Prompts & Tasks

## Team Overview

| Member | Name(s) | Role | Primary Focus |
|--------|---------|------|---------------|
| **1** | Anjika | Project Manager & UI/UX Designer | Figma designs, assets, QA testing, pitch |
| **2** | Ashwini & Anjika | Frontend - Caregiver App | React Native caregiver portal |
| **3** | Ashika | Frontend - Elderly App | React Native elderly portal (accessible) |
| **4** | Irene | Backend API & Database | Express.js API, MongoDB, authentication |
| **5** | Stephanie | AI & Voice Engineer | ElevenLabs, translation, AI summaries |
| **6** | Ray | DevOps & Escalation Scheduler | AMD Cloud, push notifications, Twilio SMS |

---

## Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEAM DEPENDENCY MAP                         │
└─────────────────────────────────────────────────────────────────┘

Phase 1:  Anjika (Design) ──────────────────────────────┐
              │                                          │
              ▼                                          │
Phase 2:  Irene (Backend) ◄─────────────────────► Ray (DevOps)
              │                                     │
              │                                     │
              ▼                                     ▼
Phase 3:  Ashwini/Anjika ◄── Stephanie (AI) ──► Ashika
          (Caregiver UI)                        (Elderly UI)
              │                                     │
              └─────────────────┬───────────────────┘
                                │
Phase 4:                   INTEGRATION
                          & DEMO PREP
```

---

## Technology Stack Reference

**Frontend**: React Native, Expo, React Navigation, Redux Toolkit, React Native Paper, Expo AV
**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer
**External APIs**: ElevenLabs, Twilio, Google Cloud Translation, Firebase Cloud Messaging
**Storage**: AMD Cloud Storage
**DevOps**: AMD Cloud, Redis, Bull Queue, Node-cron

---

# MEMBER 1: ANJIKA
## Role: Project Manager & UI/UX Designer

### Summary
You are the creative lead AND project coordinator. Your designs will be implemented by Ashwini/Anjika (Caregiver App) and Ashika (Elderly App). You ensure the team stays synchronized and the final product is polished for the pitch.

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
EchoCare is a mobile app connecting caregivers with elderly loved ones through personalized reminders. There are TWO separate user experiences:

1. CAREGIVER APP (Ashwini & Anjika will implement)
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
- Caption: 14px Regular

Elderly App (LARGER):
- H1: 36px Bold
- Body: 22px Medium
- Button: 24px Bold
```

SCREENS TO DESIGN:

Caregiver App:
1. Welcome/Login Screen
2. Registration Flow (3 steps: info, voice recording, success)
3. Dashboard (elderly profiles grid)
4. Add Elderly Screen (shows generated key)
5. Elderly Detail Screen (medications, reminders)
6. Add Medication Screen (camera + details)
7. Create Reminder - Type Selection (video/audio/text)
8. Create Reminder - Video Recording
9. Create Reminder - Audio Recording
10. Create Reminder - Voice Clone Text Input (with language selection)
11. Create Reminder - Details (priority, category, medication)
12. Create Reminder - Schedule Picker
13. Create Reminder - Confirmation
14. Settings Screen
15. Notification Sounds Picker
16. Emergency Contacts Screen

Elderly App:
1. Login Screen (6-character code, VERY LARGE)
2. Home Screen (greeting + pending reminders)
3. Reminder View - Video Player (large controls)
4. Reminder View - Audio Player (large controls)
5. More Info Screen (AI summary + medication image)
6. Success Screen (celebration animation)
7. History Screen (optional, past reminders)

NOTIFICATION SOUNDS TO CURATE:

Regular Sounds (10):
1. Soft Chime
2. Gentle Ding
3. Calm Notification
4. Soft Pop
5. Warm Bell
6. Gentle Wave
7. Light Tap
8. Sweet Tone
9. Peaceful Ring
10. Soft Alert

Emergency Sounds (10):
1. Urgent Bell
2. Alert Tone
3. Important Chime
4. Attention Sound
5. Priority Alert
6. Urgent Ping
7. Wake Up (escalating)
8. Critical Alert
9. Strong Bell
10. Immediate

Sound Requirements:
- 1-3 seconds long
- MP3 format, 44.1kHz
- Royalty-free (freesound.org, mixkit.co, zapsplat.com)
- Clear but not jarring (especially for elderly users)

DELIVERABLES FOR FRONTEND TEAMS:

For Ashwini & Anjika (Caregiver App):
- All caregiver screens in Figma
- Exported icons and illustrations
- Color codes and spacing values
- Interactive prototype for key flows

For Ashika (Elderly App):
- All elderly screens in Figma (ACCESSIBILITY FIRST)
- Large button components
- High contrast color specifications
- Simple navigation flow diagram

PROJECT MANAGEMENT:

Daily Check-ins:
1. What did each person complete?
2. What are they working on?
3. Are they blocked by anyone?

Integration Checkpoints:
- Voice Upload → Stephanie (AI) must receive file
- Reminder Creation → Ray (DevOps) must schedule it
- Notification Tap → Ashika's app must open correctly
- "I Did It" → Irene's API must update status
- Missed Task → Ray's scheduler must trigger Twilio

PITCH PREPARATION:

Demo Flow (avoid rate limits):
1. Show caregiver registration (pre-recorded voice)
2. Create elderly profile (show key generation)
3. Create a reminder (use text-to-speech to avoid video upload time)
4. Switch to elderly device, show notification arrive
5. Open reminder, show info page with medication
6. Click "I Did It" - show success
7. (Optional) Show escalation flow with test number

Have backup screenshots/videos for each step in case of demo failure!
```

---

# MEMBER 2: ASHWINI & ANJIKA
## Role: Frontend Developer - Caregiver App

### Summary
You are building the Caregiver Portal - the control center where caregivers manage their elderly loved ones and create reminders. You'll use React Native with Expo and consume APIs built by Irene (Backend) and Stephanie (AI).

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | Auth & Onboarding | Designs from Anjika, Auth API from Irene |
| **Phase 2** | Key Generation UI | Elderly API from Irene |
| **Phase 3** | Task Creation UI | Designs from Anjika |
| **Phase 4** | API Integration | All backend endpoints from Irene & Stephanie |

### Detailed Task List

#### Phase 1: Authentication & Onboarding
- [ ] Set up React Native Expo project
- [ ] Install dependencies (navigation, redux, paper, expo-av, axios)
- [ ] Create Login screen (email/password)
- [ ] Create Registration flow:
  - Step 1: Name, email, password
  - Step 2: Voice recording (20-30 seconds)
  - Step 3: Success confirmation
- [ ] Implement voice recording with Expo AV
- [ ] Create emergency contacts input form
- [ ] Create medication photo capture (Expo Camera)

#### Phase 2: Elderly Key Generation
- [ ] Build "Add Elderly" screen
- [ ] Display generated 6-character key prominently
- [ ] Add "Share Key" functionality (copy, SMS, etc.)
- [ ] Create elderly profile card component
- [ ] Build Dashboard with elderly grid/list

#### Phase 3: Task/Reminder Creation UI
- [ ] Create Reminder Type Selection screen (video/audio/text)
- [ ] Build Video Recording screen (Expo Camera)
- [ ] Build Audio Recording screen (Expo AV)
- [ ] Build Voice Clone screen:
  - Text input field
  - Source language dropdown
  - Target language toggle
  - "Preview Audio" button
- [ ] Create Reminder Details screen:
  - Title input
  - Priority selector (regular/important/emergency)
  - Category selector (medication/daily/appointment/other)
  - Medication picker (if applicable)
- [ ] Build Schedule Picker:
  - Once (date/time picker)
  - Daily (time picker)
  - Weekly (day checkboxes + time)
  - Monthly (date + time)
  - Response time limit slider (5 min - 2 hours)
- [ ] Create Confirmation screen

#### Phase 4: API Integration
- [ ] Connect registration to `POST /api/auth/register`
- [ ] Connect login to `POST /api/auth/login`
- [ ] Connect elderly creation to `POST /api/elderly`
- [ ] Connect medication creation to `POST /api/medications`
- [ ] Connect video/audio reminders to `POST /api/reminders`
- [ ] Connect voice clone to `POST /api/notifications/voice-reminder` (Stephanie's API)
- [ ] Connect preview to `POST /api/notifications/preview-voice` (Stephanie's API)
- [ ] Implement Redux state management

---

### MEMBER 2 DETAILED PROMPT

```
You are Ashwini (with support from Anjika) building the Caregiver Portal of EchoCare using React Native and Expo. This is the feature-rich app where caregivers manage everything.

PROJECT CONTEXT:
The Caregiver App is the "control center" where users:
1. Register with email/password and record a voice sample (for AI cloning)
2. Add elderly profiles (generates a unique key for their login)
3. Add medications with photos
4. Create reminders (video, audio, or AI-generated voice)
5. Schedule reminders (one-time or recurring)
6. Set notification sounds and emergency contacts

TECH STACK:
- React Native with Expo
- React Navigation (stack + tabs)
- Redux Toolkit for state management
- React Native Paper for UI components
- Expo AV for audio/video recording
- Expo Camera for video recording
- Axios for API calls

PROJECT SETUP:
```bash
npx create-expo-app caregiver-app --template blank-typescript
cd caregiver-app
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @reduxjs/toolkit react-redux
npm install react-native-paper react-native-vector-icons
npm install expo-av expo-camera expo-image-picker
npm install axios
npm install react-native-gesture-handler react-native-safe-area-context
```

FOLDER STRUCTURE:
```
src/
├── components/
│   ├── AudioRecorder.tsx
│   ├── VideoRecorder.tsx
│   ├── ElderlyCard.tsx
│   ├── MedicationPicker.tsx
│   ├── SchedulePicker.tsx
│   └── SoundSelector.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── VoiceRecordScreen.tsx
│   ├── dashboard/
│   │   ├── HomeScreen.tsx
│   │   └── ElderlyDetailScreen.tsx
│   ├── elderly/
│   │   ├── AddElderlyScreen.tsx
│   │   └── AddMedicationScreen.tsx
│   ├── reminders/
│   │   ├── ReminderTypeScreen.tsx
│   │   ├── VideoReminderScreen.tsx
│   │   ├── AudioReminderScreen.tsx
│   │   ├── VoiceCloneScreen.tsx
│   │   ├── ReminderDetailsScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   └── ConfirmScreen.tsx
│   └── settings/
│       ├── SettingsScreen.tsx
│       ├── SoundsScreen.tsx
│       └── EmergencyContactsScreen.tsx
├── store/
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── elderlySlice.ts
│       └── reminderSlice.ts
├── services/
│   └── api.ts
├── navigation/
│   └── AppNavigator.tsx
└── utils/
    └── helpers.ts
```

KEY IMPLEMENTATIONS:

1. VOICE RECORDING (Registration)
```typescript
import { Audio } from 'expo-av';

const VoiceRecordScreen = () => {
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

    // Update duration every second
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    // Upload to backend
  };

  return (
    <View>
      <Text>Record 20-30 seconds of your voice</Text>
      <Text>{duration}s / 30s</Text>
      <Button onPress={recording ? stopRecording : startRecording}>
        {recording ? 'Stop' : 'Start Recording'}
      </Button>
    </View>
  );
};
```

2. VIDEO REMINDER RECORDING
```typescript
import { Camera } from 'expo-camera';

const VideoReminderScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recordVideo = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 120, // 2 minutes max
      });
      setIsRecording(false);
      // Navigate to preview with video.uri
    }
  };

  return (
    <Camera ref={cameraRef} style={{ flex: 1 }}>
      <TouchableOpacity onPress={recordVideo}>
        <Text>{isRecording ? 'Stop' : 'Record'}</Text>
      </TouchableOpacity>
    </Camera>
  );
};
```

3. VOICE CLONE TEXT INPUT
```typescript
const VoiceCloneScreen = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const previewAudio = async () => {
    // Call Stephanie's API
    const response = await api.post('/notifications/preview-voice', {
      text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang || null,
    });
    setPreviewUrl(response.data.audioUrl);
  };

  return (
    <View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your message..."
        multiline
      />
      <Picker selectedValue={sourceLang} onValueChange={setSourceLang}>
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Spanish" value="es" />
        {/* More languages */}
      </Picker>
      <Switch
        value={!!targetLang}
        onValueChange={(v) => setTargetLang(v ? 'es' : '')}
      />
      {targetLang && (
        <Picker selectedValue={targetLang} onValueChange={setTargetLang}>
          {/* Language options */}
        </Picker>
      )}
      <Button onPress={previewAudio}>Preview Audio</Button>
      {previewUrl && <AudioPlayer uri={previewUrl} />}
    </View>
  );
};
```

4. SCHEDULE PICKER
```typescript
const ScheduleScreen = () => {
  const [scheduleType, setScheduleType] = useState('once');
  const [time, setTime] = useState(new Date());
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [responseLimit, setResponseLimit] = useState(30); // minutes

  return (
    <View>
      <SegmentedButtons
        value={scheduleType}
        onValueChange={setScheduleType}
        buttons={[
          { value: 'once', label: 'Once' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ]}
      />

      <DateTimePicker value={time} mode="time" />

      {scheduleType === 'once' && (
        <DateTimePicker value={time} mode="date" />
      )}

      {scheduleType === 'weekly' && (
        <View>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <Checkbox
              key={day}
              checked={daysOfWeek.includes(i)}
              onPress={() => toggleDay(i)}
            />
          ))}
        </View>
      )}

      <Text>Response Time Limit: {responseLimit} minutes</Text>
      <Slider
        value={responseLimit}
        onValueChange={setResponseLimit}
        minimumValue={5}
        maximumValue={120}
        step={5}
      />
    </View>
  );
};
```

API ENDPOINTS TO CALL:

Irene's APIs (Backend Core):
- POST /api/auth/register - Register caregiver (with voice file)
- POST /api/auth/login - Login
- GET /api/elderly - List linked elderly
- POST /api/elderly - Create elderly profile (returns key)
- POST /api/medications - Add medication with image
- POST /api/reminders - Create video/audio reminder
- GET /api/sounds - Get notification sounds list
- PUT /api/caregivers/settings - Update settings

Stephanie's APIs (AI & Voice):
- POST /api/notifications/voice-clone - Process voice sample after registration
- POST /api/notifications/preview-voice - Preview text-to-speech
- POST /api/notifications/voice-reminder - Create voice clone reminder

REDUX STATE STRUCTURE:
```typescript
interface AppState {
  auth: {
    user: Caregiver | null;
    token: string | null;
    isLoading: boolean;
  };
  elderly: {
    list: Elderly[];
    current: Elderly | null;
    isLoading: boolean;
  };
  reminders: {
    draft: Partial<Reminder>;
    list: Reminder[];
    isLoading: boolean;
  };
}
```

DEPENDENCIES ON OTHER TEAM MEMBERS:
- Anjika (Design): Provides Figma mockups and assets - WAIT for designs before pixel-perfect implementation
- Irene (Backend): Provides auth, elderly, medication, reminder APIs
- Stephanie (AI): Provides voice cloning and preview APIs
- Ray (DevOps): Handles the actual scheduling after you create reminders

SUCCESS CRITERIA:
- Caregiver can register with voice sample
- Can add elderly and see their unique key
- Can add medications with photos
- Can create all three reminder types
- Can schedule with all frequency options
- Can preview voice clone before sending
- All forms validate properly
- Error states handled gracefully
```

---

# MEMBER 3: ASHIKA
## Role: Frontend Developer - Elderly App

### Summary
You are building the Elderly Portal - a simplified, highly accessible app for elderly users. This must be foolproof - large buttons, clear text, simple navigation. The user might have vision impairments or limited tech experience.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | Key Login & Persistence | Designs from Anjika, Auth API from Irene |
| **Phase 2** | Push Notification Handling | FCM setup from Ray |
| **Phase 3** | More Info Page | AI summaries from Stephanie |
| **Phase 4** | "I Did It" Button | Status API from Irene |

### Detailed Task List

#### Phase 1: Authentication
- [ ] Set up React Native Expo project (separate from caregiver app)
- [ ] Create login screen with LARGE key input (6 characters)
- [ ] Each character in separate box (like OTP)
- [ ] Implement persistent login (AsyncStorage)
- [ ] Register FCM token on login
- [ ] Create welcome/home screen with greeting

#### Phase 2: Push Notification Handling
- [ ] Configure Expo Notifications
- [ ] Handle notification received (foreground)
- [ ] Handle notification tap (background → open app)
- [ ] Route to correct reminder screen on tap
- [ ] Play notification sound based on priority

#### Phase 3: More Info Page
- [ ] Create Reminder View screen
- [ ] Build large Video Player component
- [ ] Build large Audio Player component
- [ ] Create More Info screen:
  - Display AI-generated summary (large text)
  - Display medication image (full width)
  - Show medication name and dosage
- [ ] Implement auto-play on screen entry

#### Phase 4: Completion Flow
- [ ] Create LARGE "I Did It!" button (full width, green)
- [ ] Connect to acknowledgment API
- [ ] Create success animation/celebration screen
- [ ] Auto-navigate back to home after success
- [ ] Update home screen to remove completed reminders

---

### MEMBER 3 DETAILED PROMPT

```
You are Ashika, building the Elderly Portal of EchoCare. This app MUST be extremely accessible - your users may have poor vision, shaky hands, or no tech experience. Simplicity is everything.

PROJECT CONTEXT:
The Elderly App has ONE purpose: receive reminders and confirm completion. That's it.

User Journey:
1. Get access key from caregiver (verbally or written)
2. Enter key on login (ONE TIME ONLY - app remembers forever)
3. Receive push notification with custom sound
4. Tap notification → see reminder (video/audio plays)
5. View more info with AI summary and medication photo
6. Tap giant "I Did It!" button
7. See celebration, return to home

ACCESSIBILITY REQUIREMENTS (NON-NEGOTIABLE):
- Minimum font size: 22px for body text, 36px for headings
- Minimum touch target: 60x60 pixels for ALL interactive elements
- Maximum contrast: Use #000000 text on #FFFFFF background
- One action per screen: Never overwhelm with choices
- Clear feedback: Every tap should have visible/audible response
- No jargon: Say "Press here" not "Tap to authenticate"

TECH STACK:
- React Native with Expo
- React Navigation (simple stack only)
- Redux Toolkit
- Expo AV for audio/video playback
- Expo Notifications for push

PROJECT SETUP:
```bash
npx create-expo-app elderly-app --template blank-typescript
cd elderly-app
npm install @react-navigation/native @react-navigation/stack
npm install @reduxjs/toolkit react-redux
npm install react-native-paper
npm install expo-av expo-notifications
npm install axios
npm install @react-native-async-storage/async-storage
```

FOLDER STRUCTURE:
```
src/
├── components/
│   ├── BigButton.tsx         # 70px height, 24px font
│   ├── VideoPlayer.tsx       # Large controls
│   ├── AudioPlayer.tsx       # Large controls
│   ├── ReminderCard.tsx      # Large, tappable
│   └── SuccessAnimation.tsx  # Celebration effect
├── screens/
│   ├── LoginScreen.tsx       # Key entry
│   ├── HomeScreen.tsx        # Pending reminders
│   ├── ReminderScreen.tsx    # Play video/audio
│   ├── InfoScreen.tsx        # AI summary + medication
│   └── SuccessScreen.tsx     # Celebration
├── services/
│   ├── api.ts
│   └── notifications.ts
├── store/
│   └── elderlySlice.ts
└── navigation/
    └── AppNavigator.tsx
```

KEY IMPLEMENTATIONS:

1. LOGIN SCREEN (ACCESSIBILITY CRITICAL)
```typescript
const LoginScreen = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const [error, setError] = useState('');

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase();
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const accessKey = code.join('');
    try {
      const response = await api.post('/auth/elderly-login', {
        accessKey,
        fcmToken: await getFCMToken(),
      });
      // Save token, navigate to home
      await AsyncStorage.setItem('token', response.data.token);
    } catch (e) {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to EchoCare</Text>
      <Text style={styles.subtitle}>Enter your code below</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputs.current[index] = ref}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            maxLength={1}
            autoCapitalize="characters"
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <BigButton title="Sign In" onPress={handleLogin} />
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
    color: '#000000',
  },
  error: {
    fontSize: 20,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 16,
  },
});
```

2. BIG BUTTON COMPONENT
```typescript
interface BigButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success';
  icon?: string;
}

const BigButton: React.FC<BigButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon
}) => {
  const backgroundColor = variant === 'success' ? '#2E7D32' : '#1565C0';

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <MaterialIcons name={icon} size={36} color="#FFFFFF" />
      )}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 70,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
```

3. HOME SCREEN
```typescript
const HomeScreen = () => {
  const elderly = useSelector(selectElderly);
  const pendingReminders = useSelector(selectPendingReminders);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Hello, {elderly.name}!</Text>
      <Text style={styles.date}>
        {format(new Date(), 'EEEE, MMMM d')}
      </Text>

      {pendingReminders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle" size={100} color="#2E7D32" />
          <Text style={styles.emptyText}>All done for now!</Text>
        </View>
      ) : (
        <FlatList
          data={pendingReminders}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onPress={() => navigation.navigate('Reminder', { id: item._id })}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};
```

4. REMINDER SCREEN (Video/Audio Player)
```typescript
const ReminderScreen = ({ route }) => {
  const { id } = route.params;
  const reminder = useSelector(selectReminderById(id));
  const [isPlaying, setIsPlaying] = useState(true);

  const handleAcknowledge = async () => {
    await api.post(`/reminders/${id}/acknowledge`);
    navigation.navigate('Success');
  };

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
        icon="info"
        variant="primary"
        onPress={() => navigation.navigate('Info', { id })}
      />

      <View style={{ flex: 1 }} />

      <BigButton
        title="I Did It!"
        icon="check"
        variant="success"
        onPress={handleAcknowledge}
      />
    </SafeAreaView>
  );
};
```

5. PUSH NOTIFICATION HANDLING
```typescript
import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// In App.tsx or navigation setup
useEffect(() => {
  // Handle notification tap when app is in background
  const subscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      const reminderId = response.notification.request.content.data.reminderId;
      navigation.navigate('Reminder', { id: reminderId });
    }
  );

  // Handle notification when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      // Could show an in-app alert or just let it display
    }
  );

  return () => {
    subscription.remove();
    foregroundSubscription.remove();
  };
}, []);
```

6. INFO SCREEN (AI Summary + Medication)
```typescript
const InfoScreen = ({ route }) => {
  const { id } = route.params;
  const reminder = useSelector(selectReminderById(id));
  const medication = useSelector(selectMedicationById(reminder.medicationId));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{reminder.title}</Text>

      <Text style={styles.sectionHeader}>What to do:</Text>
      <Text style={styles.summary}>{reminder.aiSummary}</Text>

      {medication && (
        <>
          <Text style={styles.sectionHeader}>Medication:</Text>
          <Image
            source={{ uri: medication.imageUrl }}
            style={styles.medicationImage}
          />
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>{medication.dosage}</Text>
        </>
      )}

      <BigButton
        title="Back"
        icon="arrow-back"
        onPress={() => navigation.goBack()}
      />

      <BigButton
        title="I Did It!"
        icon="check"
        variant="success"
        onPress={handleAcknowledge}
      />
    </ScrollView>
  );
};
```

API ENDPOINTS TO CALL:

Irene's APIs:
- POST /api/auth/elderly-login - Login with access key
- GET /api/elderly/reminders - Get pending reminders
- GET /api/reminders/:id - Get reminder details
- POST /api/reminders/:id/acknowledge - Mark as done

Ray's Setup:
- POST /api/notifications/register-fcm - Register device token

DEPENDENCIES:
- Anjika (Design): Provides ACCESSIBLE designs - follow exactly
- Irene (Backend): Provides elderly auth and reminder APIs
- Stephanie (AI): AI summary appears in reminder.aiSummary field
- Ray (DevOps): Sets up push notification delivery

SUCCESS CRITERIA:
- Elderly can login with 6-character key (once)
- Push notifications arrive with correct sound
- Video/audio plays automatically
- AI summary and medication image display clearly
- "I Did It!" marks reminder complete
- All text is LARGE and READABLE
- All buttons are LARGE and EASY TO TAP
- Works for users with no tech experience
```

---

# MEMBER 4: IRENE
## Role: Backend API & Database Architect

### Summary
You are building the nervous system of EchoCare - the database and core APIs that everyone depends on. Both frontend apps (Ashwini/Anjika and Ashika) will consume your endpoints. Stephanie (AI) and Ray (DevOps) will also integrate with your data.

### Phase Breakdown

| Phase | Tasks | Deliverables |
|-------|-------|--------------|
| **Phase 1** | Database Schema | MongoDB collections for all entities |
| **Phase 2** | Auth Endpoints | Register, login (caregiver + elderly key) |
| **Phase 3** | CRUD Operations | Elderly, medications, reminders APIs |
| **Phase 4** | Status Tracking | Acknowledgment and status update APIs |

### Detailed Task List

#### Phase 1: Database Schema
- [ ] Set up Node.js + Express project
- [ ] Connect to MongoDB (Atlas or local)
- [ ] Create User (Caregiver) model
- [ ] Create Elderly model
- [ ] Create Medication model
- [ ] Create Reminder model
- [ ] Create NotificationSound model
- [ ] Create EscalationLog model
- [ ] Add proper indexes for performance

#### Phase 2: Authentication Endpoints
- [ ] Implement caregiver registration (`POST /api/auth/register`)
  - Hash passwords with bcrypt
  - Generate JWT token
  - Handle voice sample upload
- [ ] Implement caregiver login (`POST /api/auth/login`)
- [ ] Implement elderly login (`POST /api/auth/elderly-login`)
  - Validate access key
  - Generate JWT for elderly
  - Save FCM token
- [ ] Create auth middleware for protected routes

#### Phase 3: CRUD Operations
- [ ] Elderly APIs:
  - `POST /api/elderly` - Create profile, generate key
  - `GET /api/elderly` - List for caregiver
  - `GET /api/elderly/:id` - Get details
  - `PUT /api/elderly/:id` - Update
  - `DELETE /api/elderly/:id` - Deactivate
- [ ] Medication APIs:
  - `POST /api/medications` - Add with image
  - `GET /api/medications/:elderlyId` - List
  - `PUT /api/medications/:id` - Update
  - `DELETE /api/medications/:id` - Delete
- [ ] Reminder APIs:
  - `POST /api/reminders` - Create (video/audio)
  - `GET /api/reminders` - List (filtered)
  - `GET /api/reminders/:id` - Get details
  - `PUT /api/reminders/:id` - Update
  - `DELETE /api/reminders/:id` - Cancel
- [ ] Sounds API:
  - `GET /api/sounds` - List available sounds

#### Phase 4: Status Tracking
- [ ] `POST /api/reminders/:id/acknowledge` - Mark complete
- [ ] `GET /api/elderly/reminders` - Get pending for elderly
- [ ] Update reminder status flow (scheduled → sent → acknowledged)
- [ ] Create escalation log when reminder times out

---

### MEMBER 4 DETAILED PROMPT

```
You are Irene, the Backend API & Database Architect for EchoCare. You are building the foundation that EVERYONE depends on. Both frontend teams and the AI/DevOps members need your APIs.

PROJECT CONTEXT:
EchoCare needs a robust backend to:
1. Store caregivers, elderly, medications, and reminders
2. Handle authentication for both user types
3. Manage the reminder lifecycle (create → schedule → send → acknowledge)
4. Track escalations when reminders are missed

TECH STACK:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- AMD Cloud Storage for file storage

PROJECT SETUP:
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install multer uuid
npm install -D nodemon
```

FOLDER STRUCTURE:
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── s3.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Elderly.js
│   │   ├── Medication.js
│   │   ├── Reminder.js
│   │   ├── NotificationSound.js
│   │   └── EscalationLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── elderlyController.js
│   │   ├── medicationController.js
│   │   ├── reminderController.js
│   │   └── soundController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── elderly.js
│   │   ├── medications.js
│   │   ├── reminders.js
│   │   └── sounds.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── services/
│   │   ├── s3Service.js
│   │   └── keyGenerator.js
│   └── app.js
├── .env
└── package.json
```

DATABASE MODELS:

1. USER (CAREGIVER)
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  name: { type: String, required: true },
  voiceSampleUrl: { type: String, default: null },
  elevenLabsVoiceId: { type: String, default: null },
  fcmToken: { type: String, default: null },
  notificationSounds: {
    regular: { type: String, default: 'default' },
    emergency: { type: String, default: 'urgent' }
  },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: String
  }]
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
```

2. ELDERLY
```javascript
const elderlySchema = new mongoose.Schema({
  name: { type: String, required: true },
  accessKey: { type: String, required: true, unique: true, uppercase: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileImage: { type: String, default: null },
  fcmToken: { type: String, default: null },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

elderlySchema.index({ accessKey: 1 });
elderlySchema.index({ caregiverId: 1 });
```

3. MEDICATION
```javascript
const medicationSchema = new mongoose.Schema({
  elderlyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Elderly', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  dosage: { type: String, default: '' },
  instructions: { type: String, default: '' }
}, { timestamps: true });

medicationSchema.index({ elderlyId: 1 });
```

4. REMINDER
```javascript
const reminderSchema = new mongoose.Schema({
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  elderlyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Elderly', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'audio', 'voice_clone'], required: true },
  mediaUrl: { type: String, default: null },
  textContent: { type: String, default: null },
  translatedText: { type: String, default: null },
  targetLanguage: { type: String, default: null },
  priority: { type: String, enum: ['regular', 'important', 'emergency'], default: 'regular' },
  category: { type: String, enum: ['medication', 'daily_task', 'appointment', 'other'], default: 'other' },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', default: null },
  aiSummary: { type: String, default: null },
  schedule: {
    type: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], required: true },
    time: { type: String, required: true },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    dayOfMonth: { type: Number, min: 1, max: 31 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null }
  },
  responseTimeLimit: { type: Number, default: 30 },
  status: { type: String, enum: ['scheduled', 'sent', 'acknowledged', 'escalated'], default: 'scheduled' },
  sentAt: { type: Date, default: null },
  acknowledgedAt: { type: Date, default: null },
  escalatedAt: { type: Date, default: null }
}, { timestamps: true });

reminderSchema.index({ elderlyId: 1, status: 1 });
reminderSchema.index({ 'schedule.startDate': 1 });
```

KEY API IMPLEMENTATIONS:

1. ACCESS KEY GENERATOR
```javascript
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

exports.generateAccessKey = async () => {
  let key;
  let isUnique = false;

  while (!isUnique) {
    key = '';
    for (let i = 0; i < 6; i++) {
      key += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    const existing = await Elderly.findOne({ accessKey: key });
    isUnique = !existing;
  }
  return key;
};
```

2. AUTH CONTROLLER
```javascript
exports.registerCaregiver = async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const user = new User({ email, password, name });

  // Handle voice sample upload
  if (req.file) {
    const voiceUrl = await uploadToAMDCloud(req.file, 'voice-samples');
    user.voiceSampleUrl = voiceUrl;
  }

  await user.save();

  const token = jwt.sign({ userId: user._id, role: 'caregiver' }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: user._id, email: user.email, name: user.name }
  });
};

exports.loginElderly = async (req, res) => {
  const { accessKey, fcmToken } = req.body;

  const elderly = await Elderly.findOne({
    accessKey: accessKey.toUpperCase(),
    isActive: true
  }).populate('caregiverId', 'name');

  if (!elderly) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  if (fcmToken) {
    elderly.fcmToken = fcmToken;
    await elderly.save();
  }

  const token = jwt.sign({ elderlyId: elderly._id, role: 'elderly' }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.json({
    token,
    elderly: { id: elderly._id, name: elderly.name, caregiverName: elderly.caregiverId.name }
  });
};
```

3. CREATE ELDERLY
```javascript
exports.createElderly = async (req, res) => {
  const { name } = req.body;
  const accessKey = await generateAccessKey();

  const elderly = new Elderly({
    name,
    accessKey,
    caregiverId: req.userId
  });

  if (req.file) {
    const imageUrl = await uploadToAMDCloud(req.file, 'elderly-profiles');
    elderly.profileImage = imageUrl;
  }

  await elderly.save();

  res.status(201).json({
    message: 'Elderly profile created',
    elderly: {
      id: elderly._id,
      name: elderly.name,
      accessKey: elderly.accessKey,
      profileImage: elderly.profileImage
    }
  });
};
```

4. CREATE REMINDER
```javascript
exports.createReminder = async (req, res) => {
  const {
    elderlyId, title, type, textContent, targetLanguage,
    priority, category, medicationId, schedule, responseTimeLimit
  } = req.body;

  const reminder = new Reminder({
    caregiverId: req.userId,
    elderlyId,
    title,
    type,
    textContent,
    targetLanguage,
    priority,
    category,
    medicationId,
    schedule: JSON.parse(schedule),
    responseTimeLimit: responseTimeLimit || 30
  });

  if (req.file) {
    const folder = type === 'video' ? 'videos' : 'audio';
    const mediaUrl = await uploadToAMDCloud(req.file, folder);
    reminder.mediaUrl = mediaUrl;
  }

  await reminder.save();

  // IMPORTANT: Trigger Ray's scheduling service
  // const { scheduleReminder } = require('../jobs/reminderQueue');
  // await scheduleReminder(reminder);

  res.status(201).json({ message: 'Reminder created', reminder });
};
```

5. ACKNOWLEDGE REMINDER
```javascript
exports.acknowledgeReminder = async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    elderlyId: req.elderlyId
  });

  if (!reminder) {
    return res.status(404).json({ error: 'Reminder not found' });
  }

  if (reminder.status === 'acknowledged') {
    return res.status(400).json({ error: 'Already acknowledged' });
  }

  reminder.status = 'acknowledged';
  reminder.acknowledgedAt = new Date();
  await reminder.save();

  res.json({ message: 'Reminder acknowledged', reminder });
};
```

FULL API ROUTE LIST:
```
POST   /api/auth/register           - Caregiver registration
POST   /api/auth/login              - Caregiver login
POST   /api/auth/elderly-login      - Elderly login with key

GET    /api/caregivers/me           - Get current caregiver
PUT    /api/caregivers/me           - Update profile
PUT    /api/caregivers/settings     - Update settings

POST   /api/elderly                 - Create elderly profile
GET    /api/elderly                 - List elderly for caregiver
GET    /api/elderly/:id             - Get elderly details
PUT    /api/elderly/:id             - Update elderly
DELETE /api/elderly/:id             - Deactivate elderly
GET    /api/elderly/reminders       - Get pending reminders (for elderly)

POST   /api/medications             - Add medication
GET    /api/medications/:elderlyId  - List medications
PUT    /api/medications/:id         - Update medication
DELETE /api/medications/:id         - Delete medication

POST   /api/reminders               - Create reminder
GET    /api/reminders               - List reminders
GET    /api/reminders/:id           - Get reminder details
PUT    /api/reminders/:id           - Update reminder
DELETE /api/reminders/:id           - Delete reminder
POST   /api/reminders/:id/acknowledge - Mark complete

GET    /api/sounds                  - List notification sounds
```

INTEGRATION WITH OTHER MEMBERS:
- Stephanie (AI): After voice sample upload, she calls ElevenLabs. You store the returned `elevenLabsVoiceId`.
- Ray (DevOps): After you save a reminder, call his `scheduleReminder()` function to queue the notification.
- Ashwini/Anjika (Caregiver): They consume your auth, elderly, medication, reminder APIs
- Ashika (Elderly): She consumes elderly-login, elderly/reminders, acknowledge APIs

SUCCESS CRITERIA:
- All models are defined with proper indexes
- Both authentication flows work (email/password and access key)
- CRUD operations for all entities function correctly
- File uploads work with AMD Cloud Storage
- API responses are consistent (same format everywhere)
- Error handling is robust
```

---

# MEMBER 5: STEPHANIE
## Role: AI & Voice Engineer

### Summary
You are handling the "magic" of EchoCare - voice cloning with ElevenLabs, translation with Google Cloud, and AI-generated summaries. Your work makes the app feel personal and intelligent.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | ElevenLabs Setup | Voice samples from Irene's storage |
| **Phase 2** | Bi-Directional Audio | Translation API + ElevenLabs |
| **Phase 3** | AI Summarization | Text/audio content from reminders |
| **Phase 4** | Media Storage | Return URLs to Irene's database |

### Detailed Task List

#### Phase 1: ElevenLabs Setup
- [ ] Create ElevenLabs account and get API key
- [ ] Build voice cloning endpoint (`POST /api/notifications/voice-clone`)
  - Download voice sample from AMD Cloud Storage
  - Send to ElevenLabs API
  - Store returned voice_id in user record
- [ ] Test voice clone creation with sample audio

#### Phase 2: Bi-Directional Translation + Voice
- [ ] Set up Google Cloud Translation API
- [ ] Build translation service
- [ ] Build preview endpoint (`POST /api/notifications/preview-voice`)
  - Accept text + source/target language
  - Translate if needed
  - Generate speech with ElevenLabs
  - Return audio URL
- [ ] Build voice reminder creation (`POST /api/notifications/voice-reminder`)

#### Phase 3: AI Summarization
- [ ] Choose summarization approach:
  - Option A: OpenAI GPT for summaries
  - Option B: Open-source model on AMD Cloud (coordinate with Ray)
- [ ] Build summarization function
- [ ] Integrate with reminder creation flow
- [ ] Generate summaries for video transcripts and text content

#### Phase 4: Media Storage & URLs
- [ ] Upload generated audio to AMD Cloud Storage
- [ ] Return signed URLs for media access
- [ ] Ensure URLs work in frontend audio players
- [ ] Handle audio format compatibility

---

### MEMBER 5 DETAILED PROMPT

```
You are Stephanie, the AI & Voice Engineer for EchoCare. You are building the features that make this app magical - voice cloning, translation, and AI summaries.

PROJECT CONTEXT:
Your work enables:
1. Caregivers to send reminders IN THEIR OWN VOICE (even typed text)
2. Messages to be translated to any language while keeping the caregiver's voice
3. AI-generated summaries to appear on the elderly's "More Info" page

TECH STACK:
- Node.js (shared backend with Irene)
- ElevenLabs API (voice cloning + text-to-speech)
- Google Cloud Translation API
- OpenAI API (for summaries) or AMD-hosted LLM (coordinate with Ray)
- AMD Cloud Storage (for generated audio storage)

YOUR ENDPOINTS:
```
POST /api/notifications/voice-clone     - Process voice sample, create clone
POST /api/notifications/preview-voice   - Preview TTS before saving
POST /api/notifications/voice-reminder  - Create full voice clone reminder
GET  /api/notifications/languages       - List supported languages
```

KEY IMPLEMENTATIONS:

1. ELEVENLABS VOICE CLONING
```javascript
const axios = require('axios');
const FormData = require('form-data');

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1';
const API_KEY = process.env.ELEVENLABS_API_KEY;

// Create a voice clone from caregiver's 30-second sample
exports.createVoiceClone = async (audioBuffer, userName) => {
  const formData = new FormData();
  formData.append('name', `${userName}_voice`);
  formData.append('description', `EchoCare voice clone for ${userName}`);
  formData.append('files', audioBuffer, {
    filename: 'voice_sample.mp3',
    contentType: 'audio/mpeg'
  });

  const response = await axios.post(
    `${ELEVENLABS_API}/voices/add`,
    formData,
    {
      headers: {
        'xi-api-key': API_KEY,
        ...formData.getHeaders()
      }
    }
  );

  return response.data.voice_id;
};
```

2. TEXT-TO-SPEECH WITH CLONED VOICE
```javascript
exports.generateSpeech = async (text, voiceId) => {
  const response = await axios.post(
    `${ELEVENLABS_API}/text-to-speech/${voiceId}`,
    {
      text: text,
      model_id: 'eleven_multilingual_v2', // Supports 29 languages!
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true
      }
    },
    {
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );

  // Upload to AMD Cloud Storage and return URL
  const audioBuffer = Buffer.from(response.data);
  const audioUrl = await uploadBufferToAMDCloud(audioBuffer, 'generated-audio', 'audio/mpeg');
  return audioUrl;
};
```

3. GOOGLE CLOUD TRANSLATION
```javascript
const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

exports.translateText = async (text, targetLanguage, sourceLanguage = null) => {
  const options = { to: targetLanguage };
  if (sourceLanguage) options.from = sourceLanguage;

  const [translation] = await translate.translate(text, options);
  return translation;
};

exports.detectLanguage = async (text) => {
  const [detection] = await translate.detect(text);
  return detection.language;
};
```

4. CONTROLLER: PROCESS VOICE SAMPLE
```javascript
// Called after registration to create voice clone
exports.processVoiceSample = async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user.voiceSampleUrl) {
    return res.status(400).json({ error: 'No voice sample uploaded' });
  }

  // Download from AMD Cloud Storage
  const audioBuffer = await downloadFromAMDCloud(user.voiceSampleUrl);

  // Create voice clone
  const voiceId = await createVoiceClone(audioBuffer, user.name);

  // Save voice ID
  user.elevenLabsVoiceId = voiceId;
  await user.save();

  res.json({ message: 'Voice clone created', voiceId });
};
```

5. CONTROLLER: PREVIEW VOICE
```javascript
// Preview TTS before creating reminder
exports.previewVoice = async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;
  const user = await User.findById(req.userId);

  if (!user.elevenLabsVoiceId) {
    return res.status(400).json({ error: 'No voice clone available' });
  }

  let finalText = text;
  let translatedText = null;

  // Translate if target language specified
  if (targetLanguage && targetLanguage !== sourceLanguage) {
    translatedText = await translateText(text, targetLanguage, sourceLanguage);
    finalText = translatedText;
  }

  // Generate speech
  const audioUrl = await generateSpeech(finalText, user.elevenLabsVoiceId);

  res.json({
    audioUrl,
    originalText: text,
    translatedText,
    targetLanguage
  });
};
```

6. CONTROLLER: CREATE VOICE REMINDER
```javascript
exports.createVoiceReminder = async (req, res) => {
  const {
    elderlyId, title, textContent, sourceLanguage, targetLanguage,
    priority, category, medicationId, schedule, responseTimeLimit
  } = req.body;

  const user = await User.findById(req.userId);

  let finalText = textContent;
  let translatedText = null;

  // Translate if needed
  if (targetLanguage && targetLanguage !== sourceLanguage) {
    translatedText = await translateText(textContent, targetLanguage, sourceLanguage);
    finalText = translatedText;
  }

  // Generate audio
  const audioUrl = await generateSpeech(finalText, user.elevenLabsVoiceId);

  // Generate AI summary
  const aiSummary = await generateSummary(textContent);

  // Create reminder
  const reminder = new Reminder({
    caregiverId: req.userId,
    elderlyId,
    title,
    type: 'voice_clone',
    mediaUrl: audioUrl,
    textContent,
    translatedText,
    targetLanguage,
    priority,
    category,
    medicationId,
    aiSummary,
    schedule: JSON.parse(schedule),
    responseTimeLimit: responseTimeLimit || 30
  });

  await reminder.save();

  // Trigger scheduling (Ray's code)
  await scheduleReminder(reminder);

  res.status(201).json({ message: 'Voice reminder created', reminder });
};
```

7. AI SUMMARIZATION
```javascript
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateSummary = async (content) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates brief, clear summaries for elderly users. Keep summaries to 1-2 sentences. Use simple language. Be warm and friendly.'
      },
      {
        role: 'user',
        content: `Summarize this reminder message for an elderly person: "${content}"`
      }
    ],
    max_tokens: 100
  });

  return response.choices[0].message.content;
};
```

SUPPORTED LANGUAGES (ElevenLabs eleven_multilingual_v2):
```javascript
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];
```

ENVIRONMENT VARIABLES:
```
ELEVENLABS_API_KEY=your_key_here
GOOGLE_TRANSLATE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

INTEGRATION WITH OTHER MEMBERS:
- Irene (Backend): Your endpoints are part of her Express app. She stores voiceSampleUrl, you add elevenLabsVoiceId.
- Ray (DevOps): After creating a voice reminder, call his scheduleReminder() to queue it.
- Ashwini/Anjika (Caregiver): They call /preview-voice to hear audio before confirming.
- Ashika (Elderly): She displays the aiSummary field you generate.

SUCCESS CRITERIA:
- Voice cloning creates accurate voice profile from 30-second sample
- Text-to-speech generates natural audio in caregiver's voice
- Translation works for all supported languages
- AI summaries are clear and appropriate for elderly users
- Generated audio plays correctly in both apps
```

---

# MEMBER 6: RAY
## Role: DevOps, AMD Cloud & Escalation Scheduler

### Summary
You handle the infrastructure, scheduling, and the critical safety net. When a reminder needs to be sent at 3 PM, your code makes it happen. When an elderly person misses a reminder, your code triggers the emergency SMS.

### Phase Breakdown

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| **Phase 1** | AMD Cloud Setup | Backend deployment environment |
| **Phase 2** | Notification Scheduler | Bull Queue + Redis for job scheduling |
| **Phase 3** | Push Notifications | Firebase Cloud Messaging |
| **Phase 4** | Escalation System | Twilio SMS for emergencies |

### Detailed Task List

#### Phase 1: AMD Cloud Setup
- [ ] Spin up AMD cloud instances
- [ ] Deploy Node.js backend environment
- [ ] Set up MongoDB connection
- [ ] Configure Redis for Bull Queue
- [ ] (Optional) Host open-source LLM for summarization

#### Phase 2: Notification Scheduler
- [ ] Set up Bull Queue
- [ ] Create reminder queue processor
- [ ] Implement scheduling for:
  - One-time reminders
  - Daily recurring
  - Weekly recurring
  - Monthly recurring
- [ ] Handle timezone considerations
- [ ] Implement job retry logic

#### Phase 3: Push Notifications
- [ ] Set up Firebase Cloud Messaging
- [ ] Create notification sending service
- [ ] Implement custom sound support
- [ ] Handle notification priorities (regular vs emergency)
- [ ] Track delivery status

#### Phase 4: Escalation System
- [ ] Set up Twilio account
- [ ] Create SMS sending service
- [ ] Build escalation monitoring job (runs every minute)
- [ ] Detect missed reminders (past responseTimeLimit)
- [ ] Send SMS to all emergency contacts
- [ ] Push notify caregiver
- [ ] Log all escalations

---

### MEMBER 6 DETAILED PROMPT

```
You are Ray, the DevOps and Escalation Scheduler for EchoCare. You handle the infrastructure and the critical systems that make notifications work on time, every time.

PROJECT CONTEXT:
Your systems ensure:
1. Reminders are sent at exactly the scheduled time
2. Push notifications reach the elderly's device
3. If a reminder isn't acknowledged, emergency contacts get SMS alerts

TECH STACK:
- AMD Cloud (hosting)
- Node.js (same backend as Irene)
- Redis + Bull Queue (job scheduling)
- Firebase Cloud Messaging (push notifications)
- Twilio (SMS)
- node-cron (periodic tasks)

COMPONENTS YOU BUILD:
1. Reminder Queue - schedules and sends notifications
2. Escalation Monitor - watches for missed reminders
3. FCM Service - sends push notifications
4. SMS Service - sends emergency texts

KEY IMPLEMENTATIONS:

1. BULL QUEUE SETUP
```javascript
const Bull = require('bull');

const reminderQueue = new Bull('reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process reminder jobs
reminderQueue.process(async (job) => {
  const { reminderId } = job.data;

  const reminder = await Reminder.findById(reminderId)
    .populate('elderlyId')
    .populate('caregiverId');

  if (!reminder || reminder.status !== 'scheduled') {
    return { skipped: true };
  }

  const elderly = reminder.elderlyId;

  if (!elderly.fcmToken) {
    console.error('No FCM token for elderly:', elderly._id);
    return { error: 'No FCM token' };
  }

  // Determine sound based on priority
  const sound = reminder.priority === 'emergency'
    ? reminder.caregiverId.notificationSounds.emergency
    : reminder.caregiverId.notificationSounds.regular;

  // Send push notification
  await sendPushNotification(
    elderly.fcmToken,
    {
      title: reminder.title,
      body: getCategoryMessage(reminder.category)
    },
    {
      reminderId: reminder._id.toString(),
      type: reminder.type,
      priority: reminder.priority
    },
    { sound, priority: reminder.priority }
  );

  // Update status
  reminder.status = 'sent';
  reminder.sentAt = new Date();
  await reminder.save();

  return { success: true };
});
```

2. SCHEDULE REMINDER FUNCTION (Called by Irene and Stephanie)
```javascript
exports.scheduleReminder = async (reminder) => {
  const { schedule } = reminder;
  const deliveryTime = calculateDeliveryTime(schedule);
  const delay = deliveryTime.getTime() - Date.now();

  if (delay < 0) {
    // Past time - send immediately
    return reminderQueue.add(
      { reminderId: reminder._id },
      { attempts: 3 }
    );
  }

  return reminderQueue.add(
    { reminderId: reminder._id },
    { delay, attempts: 3 }
  );
};

function calculateDeliveryTime(schedule) {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const now = new Date();
  let deliveryTime = new Date(schedule.startDate);
  deliveryTime.setHours(hours, minutes, 0, 0);

  switch (schedule.type) {
    case 'once':
      return deliveryTime;
    case 'daily':
      if (deliveryTime <= now) {
        deliveryTime.setDate(deliveryTime.getDate() + 1);
      }
      return deliveryTime;
    case 'weekly':
      while (!schedule.daysOfWeek.includes(deliveryTime.getDay()) || deliveryTime <= now) {
        deliveryTime.setDate(deliveryTime.getDate() + 1);
      }
      return deliveryTime;
    case 'monthly':
      deliveryTime.setDate(schedule.dayOfMonth);
      if (deliveryTime <= now) {
        deliveryTime.setMonth(deliveryTime.getMonth() + 1);
      }
      return deliveryTime;
  }
}
```

3. FIREBASE PUSH NOTIFICATIONS
```javascript
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.sendPushNotification = async (fcmToken, notification, data, options = {}) => {
  const message = {
    token: fcmToken,
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: data,
    android: {
      priority: options.priority === 'emergency' ? 'high' : 'normal',
      notification: {
        sound: options.sound || 'default',
        channelId: options.priority === 'emergency' ? 'emergency' : 'reminders'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: options.sound ? `${options.sound}.wav` : 'default',
          badge: 1
        }
      }
    }
  };

  return admin.messaging().send(message);
};
```

4. TWILIO SMS SERVICE
```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
};

exports.sendEscalationSMS = async (contacts, elderlyName, taskTitle, caregiverName) => {
  const message = `ECHOCARE ALERT: ${elderlyName} has not responded to "${taskTitle}" from ${caregiverName}. Please check on them.`;

  const results = await Promise.allSettled(
    contacts.map(contact => sendSMS(contact.phone, message))
  );

  return results.map((result, index) => ({
    contact: contacts[index],
    success: result.status === 'fulfilled',
    error: result.reason?.message
  }));
};
```

5. ESCALATION MONITOR (CRITICAL SAFETY FEATURE)
```javascript
const cron = require('node-cron');

// Check every minute for missed reminders
exports.startEscalationMonitor = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running escalation check...');

    const now = new Date();

    // Find sent reminders past their deadline
    const overdueReminders = await Reminder.find({
      status: 'sent',
      sentAt: { $exists: true }
    }).populate('elderlyId').populate('caregiverId');

    for (const reminder of overdueReminders) {
      const sentAt = new Date(reminder.sentAt);
      const timeLimitMs = reminder.responseTimeLimit * 60 * 1000;
      const deadline = new Date(sentAt.getTime() + timeLimitMs);

      if (now > deadline) {
        await escalateReminder(reminder);
      }
    }
  });
};

async function escalateReminder(reminder) {
  const caregiver = reminder.caregiverId;
  const elderly = reminder.elderlyId;

  // Send SMS to all emergency contacts
  const smsResults = await sendEscalationSMS(
    caregiver.emergencyContacts,
    elderly.name,
    reminder.title,
    caregiver.name
  );

  // Notify caregiver via push
  if (caregiver.fcmToken) {
    await sendPushNotification(
      caregiver.fcmToken,
      {
        title: 'Missed Reminder Alert',
        body: `${elderly.name} has not responded to "${reminder.title}"`
      },
      { type: 'escalation', reminderId: reminder._id.toString() },
      { priority: 'emergency' }
    );
  }

  // Update status
  reminder.status = 'escalated';
  reminder.escalatedAt = new Date();
  await reminder.save();

  // Log escalation
  const log = new EscalationLog({
    reminderId: reminder._id,
    elderlyId: elderly._id,
    caregiverId: caregiver._id,
    contactsNotified: smsResults.map(r => ({
      name: r.contact.name,
      phone: r.contact.phone,
      notifiedAt: new Date(),
      method: 'sms',
      success: r.success
    })),
    message: `${elderly.name} did not respond to "${reminder.title}"`
  });
  await log.save();

  console.log(`Escalated reminder ${reminder._id}`);
}
```

6. FCM TOKEN REGISTRATION ENDPOINT
```javascript
exports.registerFCMToken = async (req, res) => {
  const { fcmToken } = req.body;

  // For elderly
  if (req.elderlyId) {
    await Elderly.findByIdAndUpdate(req.elderlyId, { fcmToken });
  }
  // For caregiver
  else if (req.userId) {
    await User.findByIdAndUpdate(req.userId, { fcmToken });
  }

  res.json({ message: 'FCM token registered' });
};
```

7. RECURRING REMINDER SCHEDULER
```javascript
// Run at midnight to schedule recurring reminders
exports.startRecurringScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Processing recurring reminders...');

    const now = new Date();

    const recurringReminders = await Reminder.find({
      'schedule.type': { $in: ['daily', 'weekly', 'monthly'] },
      'schedule.endDate': { $or: [{ $exists: false }, { $gte: now }] }
    });

    for (const reminder of recurringReminders) {
      const shouldSchedule = checkIfShouldScheduleToday(reminder.schedule);

      if (shouldSchedule) {
        // Clone reminder for today
        const todayReminder = new Reminder({
          ...reminder.toObject(),
          _id: undefined,
          status: 'scheduled',
          sentAt: null,
          acknowledgedAt: null,
          escalatedAt: null,
          'schedule.type': 'once',
          'schedule.startDate': now
        });

        await todayReminder.save();
        await scheduleReminder(todayReminder);
      }
    }
  });
};
```

STARTUP CODE (Add to app.js):
```javascript
const { startEscalationMonitor } = require('./jobs/escalationMonitor');
const { startRecurringScheduler } = require('./jobs/recurringReminders');

// Start background jobs
startEscalationMonitor();
startRecurringScheduler();

console.log('Background jobs started');
```

ENVIRONMENT VARIABLES:
```
REDIS_HOST=localhost
REDIS_PORT=6379
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_PROJECT_ID=your_project
```

INTEGRATION WITH OTHER MEMBERS:
- Irene (Backend): After she saves a reminder, she calls your scheduleReminder().
- Stephanie (AI): After she creates a voice reminder, she calls your scheduleReminder().
- Ashika (Elderly): Her app receives your push notifications.
- Anjika (PM): She tests the full flow including escalation.

SUCCESS CRITERIA:
- Reminders are sent at exactly the scheduled time
- Push notifications arrive on elderly devices with correct sound
- Missed reminders trigger SMS within 1-2 minutes of deadline
- Escalation logs are created for all events
- Recurring reminders schedule correctly each day
```

---

# INTEGRATION TIMELINE

| Time | Focus | Who's Working Together |
|------|-------|------------------------|
| **Hour 1-2** | Setup | Everyone sets up their environments |
| **Hour 3-4** | Phase 1 | Anjika: Designs | Irene: DB | Ray: Infrastructure |
| **Hour 5-6** | Phase 1 | Ashwini: Auth UI | Ashika: Login UI | Stephanie: ElevenLabs |
| **Hour 7-8** | Phase 2 | Ashwini: Key Gen | Irene: CRUD APIs | Ray: Queue Setup |
| **Hour 9-10** | Phase 3 | Everyone: Core Features |
| **Hour 11-12** | Phase 4 | Integration Testing |
| **Final Hours** | Demo Prep | Anjika leads, everyone supports |

---

# TESTING CHECKLIST

Before the final demo, verify:

- [ ] Caregiver can register with voice sample
- [ ] Voice clone is created in ElevenLabs
- [ ] Elderly profile created with unique key
- [ ] Elderly can login with key (one time)
- [ ] Video reminder can be created and scheduled
- [ ] Audio reminder can be created and scheduled
- [ ] Voice clone reminder (text) works with translation
- [ ] Push notification arrives on elderly device
- [ ] Notification plays correct sound (regular vs emergency)
- [ ] "I Did It!" marks reminder complete
- [ ] Missed reminder triggers SMS to emergency contacts
- [ ] Escalation notification reaches caregiver
- [ ] All UI is accessible on elderly app

---

# EMERGENCY CONTACTS FOR DEMO

Set up test phone numbers for the demo:
- Use team members' actual phones for SMS testing
- Set response time limit to 2-3 minutes for demo purposes
- Have backup video/screenshots ready

Good luck, team! Build something amazing!
