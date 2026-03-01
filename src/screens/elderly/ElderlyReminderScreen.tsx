import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Audio, Video, ResizeMode } from 'expo-av';
import { db } from '../../config/firebase';
import { getMedicationById } from '../../services/elderlyService';

const TIMER_SECONDS = 120; // 2-minute response window

interface ElderlyReminderScreenProps {
  reminderId: string;
  onAcknowledged: () => void;
  onBack: () => void;
}

type ReminderData = {
  title: string;
  type: string;
  mediaUrl?: string;
  status: string;
  medicationId?: string | null;
  taskInfo?: string;
  priority?: string;
  caregiverId?: string;
  schedule?: { time?: string };
};

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function priorityColor(priority?: string): string {
  if (priority === 'emergency') return '#C62828';
  if (priority === 'important') return '#E07B00';
  return '#1B3A6B';
}

function timerColor(secondsLeft: number): string {
  if (secondsLeft <= 30) return '#C62828';
  if (secondsLeft <= 60) return '#E07B00';
  return '#2E7D32';
}

export function ElderlyReminderScreen({
  reminderId,
  onAcknowledged,
  onBack,
}: ElderlyReminderScreenProps) {
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [medication, setMedication] = useState<{
    name: string; dosage: string; notes?: string;
  } | null>(null);
  const [secondsLeft, setSecondsLeft]         = useState(TIMER_SECONDS);
  const [escalated, setEscalated]             = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaSoundRef = useRef<Audio.Sound | null>(null);
  const escalatedRef  = useRef(false);

  // ── stop media audio (voice reminder playback) ───────────────────────────────
  const stopMediaSound = useCallback(async () => {
    const s = mediaSoundRef.current;
    if (s) {
      mediaSoundRef.current = null;
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }, []);

  // ── play voice reminder on native (iOS/Android) ───────────────────────────
  const [playingMedia, setPlayingMedia] = useState(false);
  const playMediaAudio = useCallback(async (url: string) => {
    if (Platform.OS === 'web') return;
    await stopMediaSound();
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      mediaSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setPlayingMedia(false);
          sound.unloadAsync();
          if (mediaSoundRef.current === sound) mediaSoundRef.current = null;
        }
      });
      setPlayingMedia(true);
      await sound.playAsync();
    } catch (err) {
      console.warn('Voice playback failed:', err);
      setPlayingMedia(false);
    }
  }, [stopMediaSound]);

  // ── escalate: mark reminder as missed ──────────────────────────────────────
  const handleEscalate = useCallback(async () => {
    if (escalatedRef.current) return;
    escalatedRef.current = true;
    setEscalated(true);
    try {
      await updateDoc(doc(db, 'reminders', reminderId), {
        status: 'escalated',
        escalatedAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to escalate reminder:', err);
    }
  }, [reminderId]);

  // ── acknowledge: mark done ─────────────────────────────────────────────────
  const handleDone = async () => {
    setLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);
    await stopMediaSound();
    try {
      await updateDoc(doc(db, 'reminders', reminderId), {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      });
      onAcknowledged();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── listen to reminder doc ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'reminders', reminderId), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data() as ReminderData;
        setReminder({ ...d });
        if (d.medicationId) {
          getMedicationById(d.medicationId).then(setMedication);
        } else {
          setMedication(null);
        }
      }
    });
    return () => unsubscribe();
  }, [reminderId]);

  // Alarm plays on ElderlyHomeScreen when reminder first appears; not on this screen.

  // ── auto-play video/audio when user opens reminder (after Start Task) ───────
  useEffect(() => {
    if (!reminder?.mediaUrl) return;
    if (reminder.type === 'audio' && Platform.OS !== 'web') {
      playMediaAudio(reminder.mediaUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminder?.mediaUrl, reminder?.type]);

  // ── countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!reminder) return;
    if (reminder.status === 'acknowledged' || reminder.status === 'escalated') return;

    escalatedRef.current = false;
    setSecondsLeft(TIMER_SECONDS);
    setEscalated(false);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleEscalate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderId, reminder?.status]);

  // ── cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMediaSound();
    };
  }, [stopMediaSound]);

  // ── render ─────────────────────────────────────────────────────────────────
  if (!reminder) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  const schedule = reminder as { schedule?: { time?: string; startDate?: { toDate?: () => Date; seconds?: number } } };
  const timeStr = (() => {
    // Prefer the exact startDate timestamp (PST-formatted)
    const sd = schedule.schedule?.startDate;
    if (sd) {
      const d = sd.toDate ? sd.toDate() : sd.seconds ? new Date(sd.seconds * 1000) : null;
      if (d) {
        return d.toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
        });
      }
    }
    // Fallback: plain hh:mm string
    if (schedule.schedule?.time) {
      const [h, m] = schedule.schedule.time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period} PST`;
    }
    return '—';
  })();

  const priority      = reminder.priority ?? 'important';
  const badgeColor    = priorityColor(priority);
  const tColor        = timerColor(secondsLeft);
  const pct           = secondsLeft / TIMER_SECONDS; // 1 → 0
  const isAlreadyDone = reminder.status === 'acknowledged' || reminder.status === 'escalated';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      {/* Priority badge */}
      {priority !== 'normal' && (
        <View style={[styles.priorityBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.priorityBadgeText}>
            {priority === 'emergency' ? '🚨 EMERGENCY' : '⚠️ IMPORTANT'}
          </Text>
        </View>
      )}

      <Text style={[styles.title, { color: badgeColor }]}>{reminder.title}</Text>

      {/* ── Countdown timer ── */}
      {!isAlreadyDone && (
        <View style={[styles.timerCard, { borderColor: tColor }]}>
          <Text style={styles.timerLabel}>Time to respond</Text>
          <Text style={[styles.timerText, { color: tColor }]}>{formatSeconds(secondsLeft)}</Text>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` as unknown as number, backgroundColor: tColor }]} />
          </View>
          <Text style={[styles.timerSub, { color: tColor }]}>
            {secondsLeft <= 30
              ? '⚠ Caregiver will be alerted soon!'
              : secondsLeft <= 60
              ? 'Please respond shortly'
              : 'Press Done when finished'}
          </Text>
        </View>
      )}

      {/* Escalated message */}
      {escalated && (
        <View style={styles.escalatedBanner}>
          <Text style={styles.escalatedText}>⏰ Time expired — your caregiver has been notified.</Text>
        </View>
      )}

      {/* Video / audio media */}
      {reminder.mediaUrl && reminder.type === 'video' && (
        <View style={styles.mediaWrap}>
          {Platform.OS === 'web' ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <video src={reminder.mediaUrl} controls autoPlay style={webVideoStyle as any} />
          ) : reminder.mediaUrl.toLowerCase().includes('.webm') && Platform.OS === 'ios' ? (
            <View style={[styles.mediaBox, styles.videoFallbackBox]}>
              <Text style={styles.videoFallbackText}>🎥 Video recorded on web</Text>
              <Text style={styles.videoFallbackSub}>WebM format is not supported on iOS. View on Android or web.</Text>
            </View>
          ) : (
            <View style={styles.mediaBox}>
              <Video
                source={{ uri: reminder.mediaUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                style={styles.videoPlayer}
                shouldPlay
              />
            </View>
          )}
        </View>
      )}

      {reminder.mediaUrl && reminder.type === 'audio' && (
        <View style={styles.mediaWrap}>
          {Platform.OS === 'web' ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <audio src={reminder.mediaUrl} controls autoPlay style={{ width: '100%', marginTop: 8 } as any} />
          ) : (
            <View style={styles.mediaBox}>
              <Text style={styles.mediaIcon}>🔊 Voice Message</Text>
              <Button
                mode="contained"
                icon={playingMedia ? 'stop' : 'play'}
                onPress={() => playingMedia ? stopMediaSound().then(() => setPlayingMedia(false)) : playMediaAudio(reminder.mediaUrl!)}
                style={styles.playMediaBtn}
              >
                {playingMedia ? 'Stop' : 'Play Voice Message'}
              </Button>
            </View>
          )}
        </View>
      )}

      {/* Details card */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>
          {reminder.type === 'video' ? '🎥 Video Reminder' : reminder.type === 'audio' ? '🎙 Voice Message' : '💊 Reminder'}
        </Text>
        <DetailRow label="Title"        value={medication?.name ?? reminder.title} />
        <DetailRow label="Dosage"       value={medication?.dosage ?? '—'} />
        <DetailRow label="Instructions" value={medication?.notes ?? '—'} />
        <DetailRow label="Time"         value={timeStr} />
        {reminder.taskInfo ? <DetailRow label="Caregiver's message" value={reminder.taskInfo} /> : null}
      </View>

      {/* Done button */}
      <View style={styles.buttonWrap}>
        {isAlreadyDone ? (
          <Button mode="outlined" onPress={onBack} style={styles.backButton}>
            ← Back
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleDone}
            loading={loading}
            disabled={loading}
            style={[styles.doneButton, { backgroundColor: badgeColor }]}
            contentStyle={styles.doneButtonContent}
          >
            Done ✓
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const webVideoStyle = {
  width: '100%', maxWidth: 480, borderRadius: 16, backgroundColor: '#000', display: 'block',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 80,
    alignItems: 'center', flexGrow: 1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { fontSize: 16, color: '#7A9A9A' },

  logo:  { width: 80, height: 80, marginTop: 8 },

  priorityBadge: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 8,
    borderRadius: 999,
  },
  priorityBadgeText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },

  // Timer
  timerCard: {
    marginTop: 20, width: '100%', maxWidth: 360,
    backgroundColor: '#FAFAFA', borderRadius: 16,
    borderWidth: 2, padding: 20, alignItems: 'center', gap: 8,
  },
  timerLabel: { fontSize: 13, color: '#7A9A9A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  timerText:  { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  progressTrack: {
    width: '100%', height: 8, borderRadius: 4, backgroundColor: '#E0E0E0', overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },
  timerSub:   { fontSize: 13, fontWeight: '600', marginTop: 4 },

  escalatedBanner: {
    marginTop: 16, width: '100%', maxWidth: 360,
    backgroundColor: '#FFF0F0', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#C62828',
  },
  escalatedText: { fontSize: 15, color: '#C62828', fontWeight: '700', textAlign: 'center' },

  mediaWrap: { marginTop: 20, width: '100%', maxWidth: 360 },
  mediaBox:  {
    width: '100%', height: 200, borderRadius: 16,
    backgroundColor: '#EBF5F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  videoFallbackBox: { backgroundColor: '#E0E0E0', padding: 24 },
  videoFallbackText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  videoFallbackSub: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' },
  mediaIcon: { fontSize: 32, marginBottom: 12 },
  videoPlayer: { width: '100%', height: 200, borderRadius: 16 },
  playMediaBtn: { marginTop: 8, backgroundColor: '#3DBDA7' },

  detailsCard: {
    marginTop: 20, width: '100%', maxWidth: 360,
    backgroundColor: '#EBF5F5', borderRadius: 16, padding: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B3A6B', marginBottom: 16 },
  detailRow: { marginBottom: 14 },
  detailLabel: { fontSize: 13, fontWeight: '500', color: '#7A9A9A', marginBottom: 3 },
  detailValue: { fontSize: 17, fontWeight: 'bold', color: '#1B3A6B' },

  buttonWrap: { marginTop: 32, marginBottom: 32 },
  doneButton: { width: 320, borderRadius: 12 },
  doneButtonContent: { height: 72 },
  backButton: { width: 200, borderRadius: 12, borderColor: '#7A9A9A' },
});
