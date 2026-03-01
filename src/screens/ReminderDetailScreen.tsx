import React, { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { VideoPlayer } from '../components/VideoPlayer';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { runEscalationCheck, selectCaregivers, selectReminders } from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderDetail'>;

/** Concentric-rings logo — same as home */
function EchoCareLogo() {
  return (
    <View style={logo.outer}>
      <View style={logo.mid}>
        <View style={logo.inner}>
          <View style={logo.dot} />
        </View>
      </View>
    </View>
  );
}

const logo = StyleSheet.create({
  outer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5F5',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1B3A6B',
  },
});

export function ReminderDetailScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(selectReminders);
  const caregivers = useAppSelector(selectCaregivers);

  useEffect(() => {
    dispatch(runEscalationCheck({ nowIso: new Date().toISOString() }));
  }, [dispatch]);

  const reminder = reminders.find((item) => item.id === route.params.reminderId);

  if (!reminder) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Reminder not found.</Text>
      </SafeAreaView>
    );
  }

  const caregiver = caregivers.find((c) => c.id === reminder.caregiverId);
  const elder = caregiver?.elders.find((e) => e.id === reminder.elderlyId);
  const isVideo = reminder.sourceType === 'video';
  const isAudio = reminder.sourceType === 'tts' || reminder.sourceType === 'audio';
  const isEscalated = reminder.status === 'escalated';

  const description = isVideo
    ? 'Watch this video to learn how to take your medication properly'
    : 'Tap play to hear your medication instructions';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <EchoCareLogo />
        </View>

        {/* Task title */}
        <Text style={styles.title}>{reminder.title}</Text>

        {/* Escalation warning */}
        {isEscalated && (
          <View style={styles.escalatedBox}>
            <Text style={styles.escalatedText}>
              ⚠ Missed — emergency contact notified:{'\n'}
              {elder?.emergencyContact.name} · {elder?.emergencyContact.phone}
            </Text>
          </View>
        )}

        {/* Video player */}
        {isVideo && reminder.mediaUri ? (
          <View style={styles.mediaWrap}>
            <VideoPlayer uri={reminder.mediaUri} autoPlay />
          </View>
        ) : isVideo ? (
          /* Video placeholder when no URI yet */
          <View style={styles.videoPlaceholder}>
            <Text style={styles.playIcon}>▶️</Text>
            <Text style={styles.videoLabel}>Instructional Video</Text>
          </View>
        ) : null}

        {/* Audio player */}
        {isAudio && reminder.mediaUri ? (
          <View style={styles.mediaWrap}>
            <AudioPlayer uri={reminder.mediaUri} autoPlay />
          </View>
        ) : isAudio ? (
          /* Audio placeholder when no URI yet */
          <View style={styles.audioPlaceholder}>
            <Text style={styles.speakerIcon}>🔊</Text>
            <Text style={styles.audioTypeLabel}>
              {reminder.sourceType === 'tts' ? 'Voice Message' : 'Audio Instructions'}
            </Text>
            <View style={styles.playCircle}>
              <Text style={styles.playCircleText}>▶</Text>
            </View>
          </View>
        ) : null}

        {/* Description subtitle */}
        <Text style={styles.description}>{description}</Text>

        {/* Continue button */}
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
          onPress={() => navigation.navigate('InfoScreen', { reminderId: reminder.id })}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Continue to more information"
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoWrap: {
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  escalatedBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#B71C1C',
    width: '100%',
    maxWidth: 320,
  },
  escalatedText: {
    fontSize: 20,
    color: '#B71C1C',
    fontWeight: '700',
  },
  mediaWrap: {
    width: '100%',
    maxWidth: 320,
    marginTop: 8,
  },
  /* Video placeholder */
  videoPlaceholder: {
    width: 320,
    aspectRatio: 16 / 9,
    borderRadius: 20,
    backgroundColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  playIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  videoLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  /* Audio placeholder */
  audioPlaceholder: {
    width: 320,
    borderRadius: 20,
    backgroundColor: '#EBF5F5',
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  speakerIcon: {
    fontSize: 72,
    marginBottom: 8,
  },
  audioTypeLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B3A6B',
    marginBottom: 20,
  },
  playCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircleText: {
    fontSize: 36,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    color: '#7A9A9A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    maxWidth: 300,
  },
  continueBtn: {
    width: 320,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  continueBtnPressed: {
    opacity: 0.82,
  },
  continueBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});