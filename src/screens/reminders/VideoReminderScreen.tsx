/**
 * Reminder Composer — Video tab records your face, Voice tab uses your stored voice clone.
 * Voice sample is recorded once at account setup and stored; user just types + picks language.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Platform, Pressable,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Timestamp } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { VideoRecorder } from '../../components/VideoRecorder';
import { createReminder } from '../../services/reminderService';
import { textToSpeech, fetchAudioBlob } from '../../services/voiceApiService';
import { getCaregiverVoiceId } from '../../services/voiceService';
import { auth } from '../../config/firebase';
import { VOICE_API_BASE_URL } from '../../config/voiceApi';

type MediaMode = 'video' | 'voice';
type ScheduleMode = 'now' | 'later';
type Priority = 'important' | 'emergency';
type TargetLanguage = 'en' | 'zh' | 'es' | 'pt' | 'hi';

const LANGUAGES: { code: TargetLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'hi', label: 'Hindi' },
];

interface VideoReminderScreenProps {
  elderlyId: string;
  elderlyName?: string;
  initialTab?: MediaMode;
  onSuccess?: () => void;
  onVideoRecorded?: (uri: string) => void;
}

export function VideoReminderScreen({
  elderlyId,
  elderlyName,
  initialTab = 'video',
  onSuccess,
}: VideoReminderScreenProps) {

  // ── tab ───────────────────────────────────────────────────────────────────
  const [mediaMode, setMediaMode] = useState<MediaMode>(initialTab);

  // ── video ─────────────────────────────────────────────────────────────────
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUri,  setVideoUri]  = useState<string | null>(null);

  // ── voice (uses stored clone from account) ─────────────────────────────────
  const [storedVoiceId, setStoredVoiceId] = useState<string | null>(null);
  const [voiceLoading,  setVoiceLoading]  = useState(true);
  const [voiceText,    setVoiceText]    = useState('');
  const [targetLang,   setTargetLang]   = useState<TargetLanguage>('en');
  const [generating,   setGenerating]   = useState(false);
  const [audioBlob,    setAudioBlob]    = useState<Blob | null>(null);
  const [audioUrl,     setAudioUrl]     = useState<string | null>(null);
  const [audioHttpUrl, setAudioHttpUrl] = useState<string | null>(null); // For native playback (HTTP URL)
  const [voiceError,   setVoiceError]   = useState('');
  const [playingPreview, setPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    getCaregiverVoiceId().then((id) => {
      setStoredVoiceId(id);
      setVoiceError(id ? '' : 'No voice on file. Record during account setup or in Settings.');
    }).catch(() => {
      setStoredVoiceId(null);
      setVoiceError('Could not load your voice. Check Settings.');
    }).finally(() => setVoiceLoading(false));
  }, []);

  // ── priority ──────────────────────────────────────────────────────────────
  const [priority, setPriority] = useState<Priority>('important');

  // ── title + schedule ──────────────────────────────────────────────────────
  const [title,         setTitle]         = useState('');
  const [scheduleOpen,  setScheduleOpen]  = useState(false);
  const [scheduleMode,  setScheduleMode]  = useState<ScheduleMode>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30, 0, 0);
    return d;
  });

  // ── publish ───────────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState<'sent' | 'scheduled' | null>(null);
  const [pubError,  setPubError]  = useState('');

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleVideoRecorded = (uri: string, blob?: Blob) => {
    setVideoUri(uri);
    setVideoBlob(blob ?? null);
    setResult(null);
    setPubError('');
  };

  const handleGenerate = async () => {
    if (!storedVoiceId || !voiceText.trim()) return;
    setGenerating(true);
    setVoiceError('');
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioHttpUrl(null);
    try {
      const ttsRes = await textToSpeech(voiceText.trim(), storedVoiceId, {
        sourceLanguage: 'en',
        targetLanguage: targetLang,
        useTranslation: targetLang !== 'en',
      });
      const fullUrl = ttsRes.audioUrl.startsWith('http') ? ttsRes.audioUrl : `${VOICE_API_BASE_URL}${ttsRes.audioUrl}`;
      const blob   = await fetchAudioBlob(ttsRes.audioUrl);
      const url    = Platform.OS === 'web' ? URL.createObjectURL(blob) : fullUrl;
      setAudioBlob(blob);
      setAudioUrl(url);
      setAudioHttpUrl(fullUrl);
      if (Platform.OS === 'web') {
        const audio = new window.Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
      }
    } catch (err: unknown) {
      setVoiceError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const playPreviewNative = useCallback(async () => {
    const url = audioHttpUrl ?? audioUrl;
    if (!url || Platform.OS === 'web') return;
    if (playingPreview) {
      const s = previewSoundRef.current;
      if (s) {
        try { await s.stopAsync(); await s.unloadAsync(); } catch {}
        previewSoundRef.current = null;
      }
      setPlayingPreview(false);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      previewSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setPlayingPreview(false);
          sound.unloadAsync();
          if (previewSoundRef.current === sound) previewSoundRef.current = null;
        }
      });
      setPlayingPreview(true);
      await sound.playAsync();
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Playback failed');
      setPlayingPreview(false);
    }
  }, [audioHttpUrl, audioUrl, playingPreview]);

  const handlePublish = async () => {
    const isVideo = mediaMode === 'video';
    if (isVideo && !videoBlob && !videoUri) { setPubError('Record a video first.'); return; }
    if (!isVideo && !audioBlob)             { setPubError('Generate a voice message first.'); return; }
    if (scheduleMode === 'later' && scheduledDate <= new Date()) {
      setPubError('Scheduled time must be in the future.'); return;
    }

    // Auto-fill title: use what the caregiver typed, or the voice message text, or a default
    const finalTitle = title.trim()
      || (!isVideo && voiceText.trim() ? voiceText.trim().slice(0, 60) : '')
      || (isVideo ? 'Video reminder' : 'Voice message');

    setUploading(true);
    setPubError('');
    try {
      let mediaFile: Blob;
      if (isVideo) {
        mediaFile = videoBlob ?? await (await fetch(videoUri!)).blob();
      } else {
        mediaFile = audioBlob!;
      }

      const caregiverId = auth.currentUser?.uid ?? 'demo-user';
      const isSendNow   = scheduleMode === 'now';
      const hh = scheduledDate.getHours().toString().padStart(2, '0');
      const mm = scheduledDate.getMinutes().toString().padStart(2, '0');

      await createReminder(caregiverId, elderlyId, isVideo ? 'video' : 'audio', mediaFile, {
        title: finalTitle,
        priority,
        category: 'reminder',
        schedule: isSendNow
          ? { type: 'immediate', sendNow: true, time: new Date().toISOString() }
          : { type: 'once', time: `${hh}:${mm}`, startDate: Timestamp.fromDate(scheduledDate) },
        responseTimeLimit: 60,
        initialStatus: isSendNow ? 'sent' : 'scheduled',
      });

      setResult(isSendNow ? 'sent' : 'scheduled');
      if (isSendNow) setTimeout(() => onSuccess?.(), 1500);
    } catch (err: unknown) {
      setPubError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const mediaReady = mediaMode === 'video' ? !!(videoBlob || videoUri) : !!audioBlob;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatarBadge}>
            <Text style={s.avatarLetter}>{elderlyName ? elderlyName[0].toUpperCase() : '?'}</Text>
          </View>
          <View>
            <Text style={s.headerLabel}>Reminder for</Text>
            <Text style={s.headerName}>{elderlyName ?? 'Care Recipient'}</Text>
          </View>
        </View>
        <Pressable
          style={[s.scheduleBtn, scheduleOpen && s.scheduleBtnActive]}
          onPress={() => setScheduleOpen((o) => !o)}
        >
          <Text style={s.scheduleBtnIcon}>🕐</Text>
          <Text style={[s.scheduleBtnText, scheduleOpen && s.scheduleBtnTextActive]}>
            {scheduleMode === 'now' ? 'Send Now' : formatShort(scheduledDate)}
          </Text>
        </Pressable>
      </View>

      {/* ── Schedule panel ────────────────────────────────────────────────── */}
      {scheduleOpen && (
        <View style={s.schedulePanel}>
          <View style={s.toggleRow}>
            <Pressable
              style={[s.toggleBtn, scheduleMode === 'now' && s.toggleBtnActive]}
              onPress={() => setScheduleMode('now')}
            >
              <Text style={[s.toggleTxt, scheduleMode === 'now' && s.toggleTxtActive]}>⚡ Send Now</Text>
            </Pressable>
            <Pressable
              style={[s.toggleBtn, scheduleMode === 'later' && s.toggleBtnActive]}
              onPress={() => setScheduleMode('later')}
            >
              <Text style={[s.toggleTxt, scheduleMode === 'later' && s.toggleTxtActive]}>📅 Schedule</Text>
            </Pressable>
          </View>
          {scheduleMode === 'later' && (
            <View style={s.datePickerWrap}>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  value={toDatetimeLocal(scheduledDate)}
                  min={toDatetimeLocal(new Date(Date.now() + 60_000))}
                  title="Times are in Pacific Time (PST/PDT)"
                  onChange={(e) => { if (e.target.value) setScheduledDate(parsePSTDate(e.target.value)); }}
                  style={datetimeInputStyle}
                />
              ) : (
                <Text style={s.nativeDateNote}>Selected: {formatScheduledDate(scheduledDate)}</Text>
              )}
              <View style={s.previewRow}>
                <Text style={s.previewIcon}>📅</Text>
                <View>
                  <Text style={s.previewTitle}>Will be delivered</Text>
                  <Text style={s.previewTime}>{formatScheduledDate(scheduledDate)}</Text>
                  <Text style={s.tzNote}>All times are Pacific Time (PST/PDT)</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <View style={s.tabRow}>
        <Pressable
          style={[s.tab, mediaMode === 'video' && s.tabActive]}
          onPress={() => setMediaMode('video')}
        >
          <Text style={[s.tabText, mediaMode === 'video' && s.tabTextActive]}>📹 Video</Text>
        </Pressable>
        <Pressable
          style={[s.tab, mediaMode === 'voice' && s.tabActive]}
          onPress={() => setMediaMode('voice')}
        >
          <Text style={[s.tabText, mediaMode === 'voice' && s.tabTextActive]}>🎙 Voice Message</Text>
        </Pressable>
      </View>

      {/* ── Fixed publish bar (appears once media is ready) ───────────────── */}
      {mediaReady && (
        <View style={s.publishBar}>
          {result === 'sent' ? (
            <View style={s.publishBarSuccess}>
              <Text style={s.publishBarSuccessText}>✓ Sent to {elderlyName}!</Text>
            </View>
          ) : result === 'scheduled' ? (
            <View style={s.publishBarSuccess}>
              <Text style={s.publishBarSuccessText}>✓ Scheduled for {formatShort(scheduledDate)}</Text>
              <Pressable onPress={() => onSuccess?.()}>
                <Text style={s.publishBarDashboard}>← Dashboard</Text>
              </Pressable>
            </View>
          ) : uploading ? (
            <View style={s.publishBarRow}>
              <ActivityIndicator size="small" color="#1B3A6B" />
              <Text style={s.publishBarSending}>
                {scheduleMode === 'now' ? `Sending to ${elderlyName}…` : 'Scheduling…'}
              </Text>
            </View>
          ) : (
            <>
              {/* Priority selector */}
              <View style={s.priorityRow}>
                <Text style={s.priorityLabel}>Alarm type:</Text>
                {([
                  { key: 'important', label: '⚠️ Important',  color: '#E07B00', hint: 'Regular alarm' },
                  { key: 'emergency', label: '🚨 Emergency',  color: '#C62828', hint: 'Urgent alarm' },
                ] as { key: Priority; label: string; color: string; hint: string }[]).map(({ key, label, color, hint }) => (
                  <Pressable
                    key={key}
                    style={[
                      s.priorityChip,
                      priority === key && { backgroundColor: color, borderColor: color },
                    ]}
                    onPress={() => setPriority(key)}
                  >
                    <Text style={[s.priorityChipText, priority === key && s.priorityChipTextActive]}>
                      {label}
                    </Text>
                    <Text style={[s.priorityChipHint, priority === key && s.priorityChipHintActive]}>
                      {hint}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {/* Title + Send */}
              <View style={s.publishBarRow}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Add a title…"
                  mode="outlined"
                  dense
                  style={s.publishBarInput}
                  outlineColor="#C0D8D8"
                  activeOutlineColor="#3DBDA7"
                  textColor="#1B3A6B"
                  placeholderTextColor="#9AB8B8"
                />
                <Pressable
                  style={[
                    s.publishBarBtn,
                    scheduleMode === 'later' && s.publishBarBtnSchedule,
                    priority === 'important' && s.publishBarBtnImportant,
                    priority === 'emergency' && s.publishBarBtnEmergency,
                  ]}
                  onPress={handlePublish}
                >
                  <Text style={s.publishBarBtnText}>
                    {scheduleMode === 'now' ? 'Send ↑' : 'Schedule ↑'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
          {pubError ? <Text style={s.publishBarError}>{pubError}</Text> : null}
        </View>
      )}

      <ScrollView style={s.flex1} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>

        {/* ── VIDEO TAB ───────────────────────────────────────────────────── */}
        {mediaMode === 'video' && (
          <View style={s.section}>
            <Text style={s.sectionHint}>
              Record a video — your face will appear on {elderlyName ?? 'their'}'s screen.
            </Text>
            <VideoRecorder
              onRecordingComplete={handleVideoRecorded}
              onRecordingCleared={() => { setVideoUri(null); setVideoBlob(null); }}
            />
          </View>
        )}

        {/* ── VOICE MESSAGE TAB ───────────────────────────────────────────── */}
        {mediaMode === 'voice' && (
          <View style={s.voiceContainer}>
            <Text style={s.voiceTitle}>Type a message in your voice</Text>
            <Text style={s.voiceSubtitle}>
              Your voice was recorded at account setup. Type below and choose the language — it will be spoken in your cloned voice.
            </Text>

            {voiceLoading ? (
              <View style={s.cloningRow}>
                <ActivityIndicator color="#1B3A6B" />
                <Text style={s.cloningText}>Loading your voice…</Text>
              </View>
            ) : !storedVoiceId ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{voiceError}</Text>
                <Text style={s.errorHint}>Record a voice sample during account setup. Existing users can update in Settings.</Text>
              </View>
            ) : (
              <View style={s.stepCard}>
                <TextInput
                  label={`Message to ${elderlyName ?? 'care recipient'}`}
                  value={voiceText}
                  onChangeText={(t) => { setVoiceText(t); setAudioBlob(null); setAudioUrl(null); setAudioHttpUrl(null); }}
                  placeholder={`e.g. Hi ${elderlyName ?? 'sweetheart'}, don't forget your pills!`}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={s.textArea}
                  outlineColor="#1B3A6B"
                  activeOutlineColor="#3DBDA7"
                  textColor="#1B3A6B"
                  placeholderTextColor="#7A9A9A"
                  maxLength={500}
                />
                <Text style={s.charCount}>{voiceText.length}/500</Text>

                {/* Language dropdown */}
                <Text style={s.langLabel}>Speak in (translation)</Text>
                <View style={s.langRow}>
                  {LANGUAGES.map(({ code, label }) => (
                    <Pressable
                      key={code}
                      style={[s.langChip, targetLang === code && s.langChipActive]}
                      onPress={() => { setTargetLang(code); setAudioBlob(null); setAudioUrl(null); setAudioHttpUrl(null); }}
                    >
                      <Text style={[s.langChipText, targetLang === code && s.langChipTextActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={s.langHint}>
                  {targetLang === 'en' ? 'No translation — spoken as typed.' : `Text will be translated to ${LANGUAGES.find((l) => l.code === targetLang)?.label} and spoken in your voice.`}
                </Text>

                {generating ? (
                  <View style={s.generatingRow}>
                    <ActivityIndicator color="#3DBDA7" />
                    <Text style={s.generatingText}>Generating{targetLang !== 'en' ? ' & translating' : ''}…</Text>
                  </View>
                ) : audioUrl ? (
                  <View style={s.audioPreviewBox}>
                    <Text style={s.audioPreviewTitle}>✓ Voice message ready — preview below</Text>
                    {Platform.OS === 'web' ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <audio src={audioUrl} controls style={{ width: '100%', marginTop: 8 } as any} />
                    ) : (
                      <Button
                        mode="contained"
                        icon={playingPreview ? 'stop' : 'play'}
                        onPress={playPreviewNative}
                        style={s.playPreviewBtn}
                      >
                        {playingPreview ? 'Stop' : 'Play Preview'}
                      </Button>
                    )}
                    <Button
                      mode="outlined"
                      icon="refresh"
                      onPress={handleGenerate}
                      style={s.regenBtn}
                    >
                      Re-generate
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleGenerate}
                    disabled={!voiceText.trim()}
                    icon="waveform"
                    style={s.generateBtn}
                    contentStyle={s.generateContent}
                  >
                    Generate with My Voice
                  </Button>
                )}
              </View>
            )}

            {voiceError && storedVoiceId ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{voiceError}</Text>
              </View>
            ) : null}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

const TZ = 'America/Los_Angeles';

/**
 * Returns the current LA timezone offset in milliseconds
 * (negative = LA is behind UTC, e.g. -28_800_000 for PST UTC-8).
 * Uses the REAL offset so it handles PST ↔ PDT automatically.
 */
function getLAOffsetMs(): number {
  const now   = new Date();
  const laStr = now.toLocaleString('sv-SE', { timeZone: TZ }); // "YYYY-MM-DD HH:MM:SS"
  const laAsUtc = new Date(laStr.replace(' ', 'T') + 'Z');     // treat LA wall-clock as UTC
  return laAsUtc.getTime() - now.getTime();                     // negative for PST/PDT
}

/** Format a UTC Date as "YYYY-MM-DDTHH:MM" in LA time (for datetime-local input). */
function toDatetimeLocal(d: Date): string {
  return d.toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 16).replace(' ', 'T');
}

/** Parse a datetime-local value (wall-clock, no tz) as PST/PDT → UTC Date. */
function parsePSTDate(value: string): Date {
  const naiveUtc  = new Date(value + 'Z');          // treat string as UTC first
  const offsetMs  = getLAOffsetMs();                // e.g. -28_800_000 (PST)
  return new Date(naiveUtc.getTime() - offsetMs);   // shift to true UTC
}

/** Short label e.g. "Mar 1, 3:30 PM PST" */
function formatShort(d: Date): string {
  return d.toLocaleString('en-US', {
    timeZone: TZ, month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });
}

/** Verbose label e.g. "Today at 3:30 PM PST" */
function formatScheduledDate(d: Date): string {
  const fmt = (date: Date) => date.toLocaleDateString('en-US', { timeZone: TZ });
  const today    = new Date();
  const tomorrow = new Date(Date.now() + 86_400_000);
  const dayStr =
    fmt(d) === fmt(today)    ? 'Today' :
    fmt(d) === fmt(tomorrow) ? 'Tomorrow' :
    d.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
  });
  return `${dayStr} at ${timeStr}`;
}

const datetimeInputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 16, borderRadius: 8,
  border: '1.5px solid #3DBDA7', backgroundColor: '#FFFFFF', color: '#1B3A6B',
  outline: 'none', boxSizing: 'border-box',
};

// ── styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EBF5F5' },
  flex1: { flex: 1 },

  // Header
  header: {
    backgroundColor: '#1B3A6B', paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBadge:  { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3DBDA7', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerLabel:  { fontSize: 11, color: '#A0C4C4' },
  headerName:   { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },

  scheduleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  scheduleBtnActive:     { backgroundColor: '#3DBDA7', borderColor: '#3DBDA7' },
  scheduleBtnIcon:       { fontSize: 16 },
  scheduleBtnText:       { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  scheduleBtnTextActive: { color: '#FFFFFF' },

  // Schedule panel
  schedulePanel: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#D0E8E8', gap: 12,
  },
  toggleRow:      { flexDirection: 'row', gap: 10 },
  toggleBtn:      { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#C0D8D8', alignItems: 'center', backgroundColor: '#F5FAFA' },
  toggleBtnActive:{ backgroundColor: '#1B3A6B', borderColor: '#1B3A6B' },
  toggleTxt:      { fontSize: 14, fontWeight: '600', color: '#7A9A9A' },
  toggleTxtActive:{ color: '#FFFFFF' },
  datePickerWrap: { gap: 10 },
  nativeDateNote: { fontSize: 13, color: '#7A9A9A' },
  previewRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EBF5F5', borderRadius: 8, padding: 10 },
  previewIcon:    { fontSize: 22 },
  previewTitle:   { fontSize: 11, color: '#7A9A9A' },
  previewTime:    { fontSize: 15, fontWeight: '700', color: '#1B3A6B' },
  tzNote:         { fontSize: 10, color: '#9AB8B8', marginTop: 2 },

  // Tabs
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#D0E8E8' },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive:   { borderBottomColor: '#3DBDA7' },
  tabText:     { fontSize: 14, fontWeight: '600', color: '#7A9A9A' },
  tabTextActive:{ color: '#1B3A6B' },

  // Video tab
  section:     { padding: 20, gap: 12 },
  sectionHint: { fontSize: 13, color: '#7A9A9A', lineHeight: 18, marginBottom: 4 },

  // Voice tab outer
  voiceContainer: { padding: 16, gap: 12 },
  voiceTopRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voiceTitle:     { fontSize: 16, fontWeight: '700', color: '#1B3A6B', flex: 1 },
  voiceSubtitle:  { fontSize: 13, color: '#7A9A9A', lineHeight: 18, marginBottom: 4 },
  resetText:      { fontSize: 13, color: '#3DBDA7', fontWeight: '600' },

  // Step cards
  stepCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  stepCardDone: { opacity: 0.65 },
  stepHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  stepTitle:    { fontSize: 15, fontWeight: '600', color: '#1B3A6B', flex: 1 },
  stepCheck:    { fontSize: 12, color: '#3DBDA7', fontWeight: '700' },
  stepHint:     { fontSize: 13, color: '#7A9A9A', marginBottom: 14, lineHeight: 18 },

  // Step badge
  badge:         { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  badgeActive:   { backgroundColor: '#1B3A6B' },
  badgeDone:     { backgroundColor: '#3DBDA7' },
  badgeText:     { fontSize: 13, fontWeight: '700', color: '#999' },
  badgeTextLight:{ color: '#FFFFFF' },

  // Clone step
  cloneBtn:       { backgroundColor: '#1B3A6B', borderRadius: 10, marginTop: 12 },
  cloneBtnContent:{ height: 50 },
  cloningRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  cloningText:    { fontSize: 14, color: '#1B3A6B' },

  // Generate step
  textArea:       { backgroundColor: '#FFFFFF', marginBottom: 4 },
  charCount:      { fontSize: 11, color: '#A0A0A0', textAlign: 'right', marginBottom: 12 },
  generatingRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#F0FAF8', borderRadius: 10 },
  generatingText: { fontSize: 13, color: '#1B3A6B' },
  audioPreviewBox:{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#3DBDA7', gap: 4 },
  audioPreviewTitle:{ fontSize: 13, fontWeight: '700', color: '#1B6B5A' },
  playPreviewBtn: { marginTop: 8, backgroundColor: '#3DBDA7' },
  regenBtn:       { marginTop: 10, borderColor: '#3DBDA7', borderRadius: 8 },
  generateBtn:    { backgroundColor: '#3DBDA7', borderRadius: 10 },
  generateContent:{ height: 50 },

  errorBox:   { backgroundColor: '#FFF0F0', borderRadius: 10, padding: 14 },
  errorText:  { color: '#C62828', fontSize: 13, lineHeight: 18 },
  errorHint:  { color: '#7A9A9A', fontSize: 12, marginTop: 8, lineHeight: 18 },
  langLabel:  { fontSize: 13, fontWeight: '600', color: '#1B3A6B', marginTop: 16, marginBottom: 8 },
  langRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#C0D8D8', backgroundColor: '#F5FAFA' },
  langChipActive: { backgroundColor: '#1B3A6B', borderColor: '#1B3A6B' },
  langChipText:   { fontSize: 13, fontWeight: '600', color: '#7A9A9A' },
  langChipTextActive: { color: '#FFFFFF' },
  langHint:   { fontSize: 11, color: '#9AB8B8', marginTop: 6, marginBottom: 4 },

  // Scroll area
  scroll: { flexGrow: 1, paddingBottom: 48 },

  // Fixed publish bar
  publishBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D0E8E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  publishBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishBarInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  publishBarBtn: {
    backgroundColor: '#1B3A6B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  publishBarBtnSchedule:  { backgroundColor: '#3DBDA7' },
  publishBarBtnImportant: { backgroundColor: '#E07B00' },
  publishBarBtnEmergency: { backgroundColor: '#C62828' },
  publishBarBtnDisabled:  { opacity: 0.4 },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    flexWrap: 'wrap',
  },
  priorityLabel: { fontSize: 11, color: '#7A9A9A', fontWeight: '600', marginRight: 2 },
  priorityChip: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C0D8D8',
    alignItems: 'center',
    backgroundColor: '#F5FAFA',
  },
  priorityChipText:       { fontSize: 11, fontWeight: '700', color: '#7A9A9A' },
  priorityChipTextActive: { color: '#FFFFFF' },
  priorityChipHint:       { fontSize: 9, color: '#AAAAAA', marginTop: 1 },
  priorityChipHintActive: { color: 'rgba(255,255,255,0.8)' },
  publishBarBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  publishBarSending: { fontSize: 13, color: '#1B3A6B', marginLeft: 4 },
  publishBarSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6F7F4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3DBDA7',
  },
  publishBarSuccessText: { color: '#1B6B5A', fontWeight: '700', fontSize: 14 },
  publishBarDashboard:   { color: '#3DBDA7', fontWeight: '600', fontSize: 13 },
  publishBarError:       { fontSize: 12, color: '#C62828', paddingHorizontal: 4 },
});
