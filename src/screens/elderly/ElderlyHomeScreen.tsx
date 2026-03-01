import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Pressable, ScrollView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { Audio, Video, ResizeMode } from 'expo-av';
import { db } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOUND_ASSETS, DEFAULT_REGULAR_ID, DEFAULT_EMERGENCY_ID } from '../../constants/sounds';

interface ReminderItem {
  id: string;
  title: string;
  type: string;
  status: string;
  priority?: string;
  caregiverId?: string;
  sentAt?: unknown;
  mediaUrl?: string;
}

interface ElderlyHomeScreenProps {
  elderlyId: string;
  elderlyName: string;
  onReminderPress: (reminderId: string) => void;
  onSignOut: () => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function ElderlyHomeScreen({
  elderlyId,
  elderlyName,
  onReminderPress,
  onSignOut,
}: ElderlyHomeScreenProps) {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [caregiverSounds, setCaregiverSounds] = useState<{ regular: string; emergency: string } | null>(null);
  const alarmSoundRef = useRef<Audio.Sound | null>(null);

  const stopAlarm = useCallback(async () => {
    const s = alarmSoundRef.current;
    if (s) {
      alarmSoundRef.current = null;
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('elderlyId', elderlyId);
  }, [elderlyId]);

  useEffect(() => {
    const q = query(
      collection(db, 'reminders'),
      where('elderlyId', '==', elderlyId),
      where('status', '==', 'sent')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ReminderItem[];
      setReminders(list);
    });

    return () => unsubscribe();
  }, [elderlyId]);

  const currentReminder = reminders[0];

  // Fetch caregiver sounds when reminder appears
  useEffect(() => {
    if (!currentReminder?.caregiverId) {
      setCaregiverSounds(null);
      return;
    }
    getDoc(doc(db, 'users', currentReminder.caregiverId))
      .then((snap) => {
        const data = snap.data();
        setCaregiverSounds(
          data?.notificationSounds ?? { regular: DEFAULT_REGULAR_ID, emergency: DEFAULT_EMERGENCY_ID }
        );
      })
      .catch(() =>
        setCaregiverSounds({ regular: DEFAULT_REGULAR_ID, emergency: DEFAULT_EMERGENCY_ID })
      );
  }, [currentReminder?.caregiverId]);

  // Play alarm when reminder appears on screen (before user clicks Start Task)
  useEffect(() => {
    if (!currentReminder || !caregiverSounds) return;

    const priority = currentReminder.priority ?? 'important';
    const soundId =
      priority === 'emergency'
        ? (caregiverSounds.emergency ?? DEFAULT_EMERGENCY_ID)
        : (caregiverSounds.regular ?? DEFAULT_REGULAR_ID);

    const source = SOUND_ASSETS[soundId];
    if (!source) return;

    let mounted = true;
    (async () => {
      await stopAlarm();
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          interruptionModeIOS: 1, // DoNotMix
          interruptionModeAndroid: 1,
        });
        const { sound } = await Audio.Sound.createAsync(source, { isLooping: true, volume: 1.0 });
        if (!mounted) {
          await sound.unloadAsync();
          return;
        }
        alarmSoundRef.current = sound;
        await sound.playAsync();
      } catch (err) {
        console.warn('Alarm playback failed:', err);
      }
    })();

    return () => {
      mounted = false;
      stopAlarm();
    };
  }, [!!currentReminder, !!caregiverSounds, currentReminder?.priority, stopAlarm]);

  // Stop alarm when user clicks Start Task (before navigating)
  const handleStartTask = useCallback(() => {
    stopAlarm();
    if (currentReminder) onReminderPress(currentReminder.id);
  }, [currentReminder, onReminderPress, stopAlarm]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator>
      {/* Greeting - 36px bold #1B3A6B */}
      <Text style={styles.greeting}>
        {getGreeting()}, {elderlyName}
      </Text>

      {/* Logo - 120x120 */}
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {currentReminder ? (
        <>
          {/* Priority label above card */}
          {currentReminder.priority && currentReminder.priority !== 'normal' && (
            <View style={[
              styles.priorityBanner,
              currentReminder.priority === 'emergency' && styles.priorityBannerEmergency,
              currentReminder.priority === 'important' && styles.priorityBannerImportant,
            ]}>
              <Text style={styles.priorityBannerText}>
                {currentReminder.priority === 'emergency' ? '🚨 EMERGENCY REMINDER' : '⚠️ IMPORTANT REMINDER'}
              </Text>
            </View>
          )}

          {/* Reminder card — color changes with priority */}
          <View style={[
            styles.reminderCard,
            currentReminder.priority === 'emergency' && styles.reminderCardEmergency,
            currentReminder.priority === 'important'  && styles.reminderCardImportant,
          ]}>
            <Text style={styles.reminderTitle}>{currentReminder.title}</Text>
            <Text style={styles.reminderType}>
              {currentReminder.type === 'video' ? '🎥 Video' : currentReminder.type === 'audio' ? '🎙 Voice' : '📋 Task'}
            </Text>
          </View>

          {/* Embedded video — show on broadcast screen when it's a video reminder */}
          {currentReminder.mediaUrl && currentReminder.type === 'video' && (
            <View style={styles.videoWrap}>
              {Platform.OS === 'web' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <video
                  src={currentReminder.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  style={styles.webVideo as any}
                />
              ) : currentReminder.mediaUrl.toLowerCase().includes('.webm') && Platform.OS === 'ios' ? (
                <View style={styles.videoFallback}>
                  <Text style={styles.videoFallbackText}>🎥 Video (recorded on web)</Text>
                  <Text style={styles.videoFallbackSub}>Tap Start Task to view in browser, or use Android.</Text>
                </View>
              ) : (
                <Video
                  source={{ uri: currentReminder.mediaUrl }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  style={styles.videoPlayer}
                  shouldPlay
                  isLooping={false}
                />
              )}
            </View>
          )}

          {/* Start Task button */}
          <Pressable
            style={[
              styles.startButton,
              currentReminder.priority === 'emergency' && styles.startButtonEmergency,
              currentReminder.priority === 'important'  && styles.startButtonImportant,
            ]}
            onPress={handleStartTask}
          >
            <Text style={styles.startButtonText}>Start Task →</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>All done for now!</Text>
        </View>
      )}

      <Button mode="text" onPress={onSignOut} style={styles.signOut}>
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 60,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
    marginTop: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 32,
  },
  priorityBanner: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E07B00',
  },
  priorityBannerImportant: { backgroundColor: '#E07B00' },
  priorityBannerEmergency: { backgroundColor: '#C62828' },
  priorityBannerText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  reminderCard: {
    width: 320,
    minHeight: 180,
    backgroundColor: '#1B3A6B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 10,
  },
  reminderCardImportant: { backgroundColor: '#E07B00' },
  reminderCardEmergency: { backgroundColor: '#C62828' },
  videoWrap: {
    width: 320,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    display: 'block',
  },
  videoPlayer: {
    width: 320,
    height: 180,
  },
  videoFallback: {
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  videoFallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  videoFallbackSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  reminderTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  reminderType: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  startButton: {
    width: 320,
    height: 80,
    backgroundColor: '#3DBDA7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  startButtonImportant: { backgroundColor: '#E07B00' },
  startButtonEmergency: { backgroundColor: '#C62828' },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  empty: {
    marginTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#7A9A9A',
  },
  signOut: {
    marginTop: 48,
  },
});
