import React, { useState, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { User } from 'firebase/auth';
import { subscribeToAuthState, loginCaregiver, registerCaregiver, loginElderly, signOut } from '../services/authService';
import { setupPushNotifications, registerForPushNotifications } from '../services/notificationService';
import { getElderlyById } from '../services/elderlyService';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { VoiceCloningDemoScreen } from '../screens/demo/VoiceCloningDemoScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ElderlyLoginScreen } from '../screens/auth/ElderlyLoginScreen';
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { AddElderlyScreen } from '../screens/elderly/AddElderlyScreen';
import { SelectElderlyForReminderScreen } from '../screens/elderly/SelectElderlyForReminderScreen';
import { AddMedicationScreen } from '../screens/elderly/AddMedicationScreen';
import { ElderlyHomeScreen } from '../screens/elderly/ElderlyHomeScreen';
import { ElderlyReminderScreen } from '../screens/elderly/ElderlyReminderScreen';
import { ReminderTypeScreen } from '../screens/reminders/ReminderTypeScreen';
import { VideoReminderScreen } from '../screens/reminders/VideoReminderScreen';
import { VoiceCloneScreen } from '../screens/reminders/VoiceCloneScreen';
import { ScheduleScreen } from '../screens/reminders/ScheduleScreen';
import { RemindersListScreen } from '../screens/reminders/RemindersListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { createReminder } from '../services/reminderService';
import { createVoiceReminder } from '../services/voiceService';
import { toRayScheduleFormat } from '../utils/scheduleUtils';
import type { Elderly } from '../types';
import type { ReminderSchedule } from '../types';
import { DEMO_MODE } from '../config/voiceApi';

export type RootStackParamList = {
  Welcome: undefined;
  VoiceCloningDemo: undefined;
  Login: undefined;
  Register: undefined;
  ElderlyLogin: undefined;
  Home: undefined;
  SelectElderlyForReminder: undefined;
  RemindersList: undefined;
  Settings: undefined;
  AddElderly: undefined;
  AddMedication: { elderly: Elderly };
  ReminderType: { elderlyId: string };
  VideoReminder: { elderlyId: string; elderlyName?: string; initialTab?: 'video' | 'voice' };
  VoiceClone: { elderlyId: string };
  Schedule: {
    elderlyId: string;
    type: 'video' | 'voice';
    videoUrl?: string;
    voiceUri?: string;
  };
  ElderlyHome: undefined;
  ElderlyReminder: { reminderId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [demoUser, setDemoUser] = useState<boolean>(false);
  const [elderlyId, setElderlyId] = useState<string | null>(null);
  const [elderlyName, setElderlyName] = useState<string>('');
  const [initializing, setInitializing] = useState(true);

  const effectiveUser = user || (DEMO_MODE && demoUser ? { uid: 'demo' } : null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const tokenResult = await authUser.getIdTokenResult();
        const eId = tokenResult.claims?.elderlyId as string | undefined;
        setElderlyId(eId ?? null);
        if (eId) {
          const elderly = await getElderlyById(eId);
          setElderlyName(elderly?.name ?? '');
        } else {
          setElderlyName('');
          setupPushNotifications(authUser.uid).catch((err) =>
            console.warn('Push setup failed:', err)
          );
        }
      } else {
        setElderlyId(null);
        setElderlyName('');
      }
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!effectiveUser ? (
          <>
            <Stack.Screen
              name="Welcome"
              options={{ headerShown: false }}
            >
              {(props) => (
                <WelcomeScreen
                  onCreateAccount={() => props.navigation.navigate('Register')}
                  onCaregiverSignIn={() => props.navigation.navigate('Login')}
                  onElderlySignIn={() => props.navigation.navigate('ElderlyLogin')}
                  onVoiceDemo={() => props.navigation.navigate('VoiceCloningDemo')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="VoiceCloningDemo" options={{ title: 'Voice Clone Demo' }}>
              {(props) => (
                <VoiceCloningDemoScreen onBack={() => props.navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login" options={{ title: 'Caregiver Sign In' }}>
              {(props) => (
                <LoginScreen
                  onLogin={DEMO_MODE ? async () => {} : loginCaregiver}
                  onLoginSuccess={() => {
                    if (DEMO_MODE) setDemoUser(true);
                  }}
                  onNavigateToRegister={() =>
                    props.navigation.navigate('Register')
                  }
                  onBack={() => props.navigation.navigate('Welcome')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ title: 'Create Account' }}>
              {(props) => (
                <RegisterScreen
                  onRegister={DEMO_MODE ? async () => 'demo-user-id' : registerCaregiver}
                  onRegisterSuccess={() => {
                    if (DEMO_MODE) setDemoUser(true);
                  }}
                  onNavigateToLogin={() => props.navigation.navigate('Login')}
                  onBack={() => props.navigation.navigate('Welcome')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ElderlyLogin" options={{ title: 'Elderly Sign In' }}>
              {(props) => (
                <ElderlyLoginScreen
                  onLogin={async (key) => {
                    const token = await registerForPushNotifications().catch(() => null);
                    await loginElderly(key, token ?? undefined);
                  }}
                  onLoginSuccess={() => {}}
                  onBack={() => props.navigation.navigate('Welcome')}
                />
              )}
            </Stack.Screen>
          </>
        ) : elderlyId && user ? (
          <>
            <Stack.Screen
              name="ElderlyHome"
              options={{ headerShown: false }}
            >
              {(props) => (
                <ElderlyHomeScreen
                  elderlyId={elderlyId}
                  elderlyName={elderlyName}
                  onReminderPress={(reminderId) =>
                    props.navigation.navigate('ElderlyReminder', { reminderId })
                  }
                  onSignOut={async () => {
                    try {
                      await signOut();
                    } catch (err) {
                      console.warn('Sign out error, forcing local clear:', err);
                      setUser(null);
                      setElderlyId(null);
                    }
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ElderlyReminder"
              options={{ title: 'Reminder' }}
            >
              {(props) => (
                <ElderlyReminderScreen
                  reminderId={props.route.params.reminderId}
                  onAcknowledged={() => props.navigation.navigate('ElderlyHome')}
                  onBack={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{ headerShown: false }}
            >
              {(props) => (
                <HomeScreen
                  onAddElderly={() => props.navigation.navigate('AddElderly')}
                  onAddMedication={(elderly) =>
                    props.navigation.navigate('AddMedication', { elderly })
                  }
                  onAddReminder={(elderly) =>
                    props.navigation.navigate('ReminderType', {
                      elderlyId: elderly.id,
                    })
                  }
                  onElderlyPress={(elderly) =>
                    props.navigation.navigate('VideoReminder', {
                      elderlyId: elderly.id,
                      elderlyName: elderly.name,
                      initialTab: 'video',
                    })
                  }
                  onElderlyVoicePress={(elderly) =>
                    props.navigation.navigate('VideoReminder', {
                      elderlyId: elderly.id,
                      elderlyName: elderly.name,
                      initialTab: 'voice',
                    })
                  }
                  onCreateReminder={() =>
                    props.navigation.navigate('SelectElderlyForReminder')
                  }
                  onViewReminders={() =>
                    props.navigation.navigate('RemindersList')
                  }
                  onSettings={() => props.navigation.navigate('Settings')}
                  onSignOut={DEMO_MODE
                    ? () => setDemoUser(false)
                    : async () => {
                        try {
                          await signOut();
                        } catch (err) {
                          console.warn('Sign out error, forcing local clear:', err);
                          setUser(null);
                        }
                      }
                  }
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SelectElderlyForReminder" options={{ title: 'Create Reminder' }}>
              {(props) => (
                <SelectElderlyForReminderScreen
                  onSelect={(elderly, tab) =>
                    props.navigation.navigate('VideoReminder', {
                      elderlyId: elderly.id,
                      elderlyName: elderly.name,
                      initialTab: tab,
                    })
                  }
                  onAddElderly={() => props.navigation.navigate('AddElderly')}
                  onBack={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="RemindersList" options={{ title: 'My Reminders' }}>
              {(props) => (
                <RemindersListScreen
                  onNavigateToHome={() => props.navigation.navigate('Home')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Settings" options={{ title: 'Settings' }}>
              {() => <SettingsScreen />}
            </Stack.Screen>
            <Stack.Screen name="AddElderly" options={{ title: 'Add Care Recipient' }}>
              {(props) => (
                <AddElderlyScreen
                  userId={user!.uid}
                  onSuccess={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddMedication" options={{ title: 'Add Medication' }}>
              {(props) => (
                <AddMedicationScreen
                  elderly={props.route.params.elderly}
                  onSuccess={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ReminderType" options={{ title: 'New Reminder' }}>
              {(props) => (
                <ReminderTypeScreen
                  selectedType={undefined}
                  onSelect={(t) => {
                    if (t === 'video') {
                      props.navigation.navigate('VideoReminder', {
                        elderlyId: props.route.params.elderlyId,
                      });
                    } else {
                      props.navigation.navigate('Schedule', {
                        elderlyId: props.route.params.elderlyId,
                        type: 'voice',
                      });
                    }
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="VideoReminder"
              options={({ route, navigation }) => ({
                title: route.params.elderlyName
                  ? `Reminder for ${route.params.elderlyName}`
                  : 'New Reminder',
                headerStyle: { backgroundColor: '#1B3A6B' },
                headerTintColor: '#FFFFFF',
                headerLeft: () => (
                  <Pressable
                    onPress={() => navigation.goBack()}
                    style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>← Back</Text>
                  </Pressable>
                ),
              })}
            >
              {(props) => (
                <VideoReminderScreen
                  elderlyId={props.route.params.elderlyId}
                  elderlyName={props.route.params.elderlyName}
                  initialTab={props.route.params.initialTab}
                  onSuccess={() => props.navigation.popToTop()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="VoiceClone" options={{ title: 'Record Voice' }}>
              {(props) => (
                <VoiceCloneScreen
                  onVoiceRecorded={(uri) =>
                    props.navigation.navigate('Schedule', {
                      elderlyId: props.route.params.elderlyId,
                      type: 'voice',
                      voiceUri: uri,
                    })
                  }
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Schedule" options={{ title: 'Reminder Details' }}>
              {(props) => (
                <ScheduleScreen
                  elderlyId={props.route.params.elderlyId}
                  reminderType={props.route.params.type}
                  onScheduleComplete={async (
                    schedule: ReminderSchedule,
                    title: string,
                    details: {
                      priority: string;
                      category: string;
                      medicationId?: string;
                      sourceLanguage?: string;
                      targetLanguage?: string;
                      responseTimeLimit?: number;
                      taskInfo?: string;
                    }
                  ) => {
                    const { elderlyId: eId, type, videoUrl, voiceUri } =
                      props.route.params;
                    const raySchedule = toRayScheduleFormat(schedule);
                    const caregiverId = user?.uid ?? 'demo-user-id';
                    const responseTimeLimit = details.responseTimeLimit ?? 60;
                    if (type === 'voice') {
                      await createVoiceReminder({
                        caregiverId,
                        elderlyId: eId,
                        title,
                        textContent: title,
                        taskInfo: details.taskInfo,
                        sourceLanguage: details.sourceLanguage ?? 'en',
                        targetLanguage: details.targetLanguage ?? null,
                        priority: details.priority,
                        category: details.category,
                        medicationId: details.medicationId ?? null,
                        schedule: raySchedule,
                        responseTimeLimit,
                      });
                    } else {
                      const mediaUri = type === 'video' ? videoUrl : voiceUri;
                      if (!mediaUri) return;
                      const response = await fetch(mediaUri);
                      const mediaFile = await response.blob();
                      const reminderType = type === 'video' ? 'video' : 'audio';
                      await createReminder(
                        caregiverId,
                        eId,
                        reminderType,
                        mediaFile,
                        {
                          title,
                          taskInfo: details.taskInfo,
                          priority: details.priority,
                          category: details.category,
                          medicationId: details.medicationId,
                          schedule: raySchedule,
                          responseTimeLimit,
                        }
                      );
                    }
                    props.navigation.popToTop();
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
