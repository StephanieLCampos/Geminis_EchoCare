/**
 * Voice Cloning Demo — works WITHOUT Firebase.
 * Flow: Record voice → clone via ElevenLabs → type text → hear your cloned voice.
 * Run the voice backend first: npm run voice-server
 */
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { AudioRecorder } from '../../components/AudioRecorder';
import { createVoiceClone, textToSpeech } from '../../services/voiceApiService';
import { VOICE_API_BASE_URL } from '../../config/voiceApi';

interface Props {
  onBack: () => void;
}

type Phase = 'record' | 'cloning' | 'ready';

function StepBadge({ num, active, done }: { num: number; active: boolean; done: boolean }) {
  return (
    <View
      style={[
        styles.badge,
        done && styles.badgeDone,
        active && styles.badgeActive,
      ]}
    >
      <Text style={[styles.badgeText, (active || done) && styles.badgeTextLight]}>
        {done ? '✓' : String(num)}
      </Text>
    </View>
  );
}

export function VoiceCloningDemoScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('record');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // keep a ref to the native sound so we can unload it
  const soundRef = useRef<import('expo-av').Audio.Sound | null>(null);

  const handleRecordComplete = (blob: Blob) => {
    setVoiceBlob(blob);
    setError('');
  };

  const handleClone = async () => {
    if (!voiceBlob) return;
    setPhase('cloning');
    setError('');
    try {
      const result = await createVoiceClone(voiceBlob, 'demo-voice');
      setVoiceId(result.voiceId);
      setPhase('ready');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Clone failed — is the voice server running? (npm run voice-server)'
      );
      setPhase('record');
    }
  };

  const handleGenerate = async () => {
    if (!voiceId || !text.trim()) return;
    setGenerating(true);
    setError('');
    setAudioUrl(null);

    try {
      const result = await textToSpeech(text.trim(), voiceId, { useTranslation: false });
      const fullUrl = result.audioUrl.startsWith('http')
        ? result.audioUrl
        : `${VOICE_API_BASE_URL}${result.audioUrl}`;
      setAudioUrl(fullUrl);
      await playAudio(fullUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const playAudio = async (url: string) => {
    setPlaying(true);
    try {
      if (Platform.OS === 'web') {
        await new Promise<void>((resolve, reject) => {
          const audio = new (window as any).Audio(url);
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('Audio playback failed'));
          audio.play().catch(reject);
        });
      } else {
        const { Audio } = await import('expo-av');
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        soundRef.current = sound;
        await sound.playAsync();
        await new Promise<void>((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && !status.isPlaying && status.positionMillis > 0) {
              resolve();
            }
          });
        });
      }
    } finally {
      setPlaying(false);
    }
  };

  const handleReset = () => {
    setPhase('record');
    setVoiceBlob(null);
    setVoiceId(null);
    setText('');
    setAudioUrl(null);
    setError('');
  };

  const recordDone = !!voiceBlob;
  const cloneDone = phase === 'ready';

  return (
    <View style={styles.outer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Voice Clone Demo</Text>
        {cloneDone && (
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        )}
        {!cloneDone && <View style={{ width: 48 }} />}
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
        <Text style={styles.subtitle}>
          Record your voice, clone it with ElevenLabs, then type any message to hear it spoken in your voice.
        </Text>

        {/* Step 1: Record */}
        <View style={[styles.section, cloneDone && styles.sectionDone]}>
          <View style={styles.sectionHeader}>
            <StepBadge num={1} active={phase === 'record'} done={recordDone} />
            <Text style={styles.sectionTitle}>Record voice sample</Text>
            {recordDone && <Text style={styles.sectionCheck}>Recorded ✓</Text>}
          </View>
          {!cloneDone && (
            <>
              <Text style={styles.sectionHint}>Speak for 20–30 seconds for best results.</Text>
              <AudioRecorder onRecordingComplete={handleRecordComplete} />
            </>
          )}
        </View>

        {/* Step 2: Clone */}
        {recordDone && (
          <View style={[styles.section, cloneDone && styles.sectionDone]}>
            <View style={styles.sectionHeader}>
              <StepBadge num={2} active={phase === 'cloning'} done={cloneDone} />
              <Text style={styles.sectionTitle}>Clone with ElevenLabs</Text>
              {cloneDone && <Text style={styles.sectionCheck}>Cloned ✓</Text>}
            </View>
            {phase === 'cloning' ? (
              <View style={styles.cloningRow}>
                <ActivityIndicator size="small" color="#1B3A6B" />
                <Text style={styles.cloningText}>Uploading sample and creating clone…</Text>
              </View>
            ) : !cloneDone ? (
              <>
                <Text style={styles.sectionHint}>
                  This sends the recording to the voice backend which uploads it to ElevenLabs.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleClone}
                  style={styles.cloneBtn}
                  contentStyle={styles.cloneBtnContent}
                >
                  Clone My Voice
                </Button>
                <Button mode="text" onPress={() => setVoiceBlob(null)} style={{ marginTop: 4 }}>
                  Re-record
                </Button>
              </>
            ) : null}
          </View>
        )}

        {/* Step 3: Type & play */}
        {cloneDone && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StepBadge num={3} active done={false} />
              <Text style={styles.sectionTitle}>Type a message to speak</Text>
            </View>
            <Text style={styles.sectionHint}>
              ElevenLabs will generate audio in your cloned voice.
            </Text>
            <TextInput
              label="Your message"
              value={text}
              onChangeText={setText}
              placeholder="e.g. Don't forget to take your medicine!"
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              outlineColor="#1B3A6B"
              activeOutlineColor="#3DBDA7"
              textColor="#1B3A6B"
              placeholderTextColor="#7A9A9A"
            />
            <Button
              mode="contained"
              onPress={handleGenerate}
              loading={generating}
              disabled={generating || playing || !text.trim()}
              style={styles.generateBtn}
              contentStyle={styles.generateBtnContent}
              icon={playing ? 'volume-high' : 'play'}
            >
              {generating ? 'Generating…' : playing ? 'Playing…' : 'Generate & Play'}
            </Button>
            {audioUrl && !generating && !playing && (
              <Button
                mode="outlined"
                icon="replay"
                onPress={() => playAudio(audioUrl)}
                style={styles.replayBtn}
              >
                Play Again
              </Button>
            )}
            <Text style={styles.voiceIdHint}>Voice ID: {voiceId?.slice(0, 16)}…</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.footnote}>
          Backend: {VOICE_API_BASE_URL}{'\n'}
          Start it with: npm run voice-server
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#F8FBFB' },
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0EEEE',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: '#1B3A6B', fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1B3A6B' },
  resetText: { fontSize: 14, color: '#3DBDA7', fontWeight: '500' },
  content: { padding: 20, paddingBottom: 56 },
  subtitle: {
    fontSize: 14,
    color: '#7A9A9A',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionDone: {
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B3A6B',
    flex: 1,
  },
  sectionCheck: {
    fontSize: 13,
    color: '#3DBDA7',
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 13,
    color: '#7A9A9A',
    marginBottom: 16,
    lineHeight: 18,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: '#1B3A6B' },
  badgeDone: { backgroundColor: '#3DBDA7' },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#999' },
  badgeTextLight: { color: '#FFFFFF' },
  cloningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  cloningText: { fontSize: 14, color: '#1B3A6B' },
  cloneBtn: {
    backgroundColor: '#1B3A6B',
    borderRadius: 12,
    marginTop: 4,
  },
  cloneBtnContent: { height: 52 },
  textInput: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  generateBtn: {
    backgroundColor: '#3DBDA7',
    borderRadius: 12,
  },
  generateBtnContent: { height: 56 },
  replayBtn: {
    marginTop: 10,
    borderColor: '#3DBDA7',
    borderRadius: 12,
  },
  voiceIdHint: {
    fontSize: 11,
    color: '#B0C4C4',
    marginTop: 14,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  errorText: { color: '#C62828', fontSize: 13, lineHeight: 18 },
  footnote: {
    marginTop: 24,
    fontSize: 11,
    color: '#B0C4C4',
    textAlign: 'center',
    lineHeight: 18,
  },
});
