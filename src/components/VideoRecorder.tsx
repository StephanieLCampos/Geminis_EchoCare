/**
 * VideoRecorder — cross-platform video recording component.
 * Web: uses MediaRecorder API with camera/mic access.
 * Native: uses expo-image-picker (camera + library) with preview.
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { Video, ResizeMode } from 'expo-av';

interface VideoRecorderProps {
  onRecordingComplete: (uri: string, blob?: Blob) => void;
  onRecordingCleared?: () => void;
  maxDurationSeconds?: number;
}

export function VideoRecorder({ onRecordingComplete, onRecordingCleared, maxDurationSeconds = 120 }: VideoRecorderProps) {
  if (Platform.OS === 'web') {
    return <WebVideoRecorder onRecordingComplete={onRecordingComplete} maxDurationSeconds={maxDurationSeconds} />;
  }
  return <NativeVideoRecorder onRecordingComplete={onRecordingComplete} onRecordingCleared={onRecordingCleared} />;
}

// ─── WEB ─────────────────────────────────────────────────────────────────────

function WebVideoRecorder({ onRecordingComplete, maxDurationSeconds }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<'idle' | 'previewing' | 'recording' | 'done'>('idle');
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startPreview = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }
      setPhase('previewing');
    } catch (err) {
      setError('Camera access denied. Please allow camera/microphone access and try again.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setPhase('done');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
      stopStream();
      onRecordingComplete(url, blob);
    };

    mr.start(250);
    setPhase('recording');
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= (maxDurationSeconds ?? 120)) {
          stopRecording();
          return s + 1;
        }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    mediaRecorderRef.current?.stop();
  };

  const reRecord = () => {
    setRecordedUrl(null);
    setElapsed(0);
    setPhase('idle');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <video
        ref={videoRef as any}
        style={videoStyle}
        playsInline
        autoPlay={phase === 'previewing' || phase === 'recording'}
      />

      {phase === 'idle' && (
        <Button mode="contained" onPress={startPreview} style={styles.btn} icon="camera">
          Open Camera
        </Button>
      )}

      {phase === 'previewing' && (
        <Button mode="contained" onPress={startRecording} style={[styles.btn, styles.btnRecord]} icon="record">
          Start Recording
        </Button>
      )}

      {phase === 'recording' && (
        <View style={styles.recordingRow}>
          <View style={styles.recDot} />
          <Text style={styles.recTimer}>{fmt(elapsed)}</Text>
          <Button mode="contained" onPress={stopRecording} style={[styles.btn, styles.btnStop]} icon="stop">
            Stop
          </Button>
        </View>
      )}

      {phase === 'done' && (
        <View style={styles.doneRow}>
          <Text style={styles.doneText}>✓ Video recorded ({fmt(elapsed)})</Text>
          <Button mode="outlined" onPress={reRecord} style={styles.btn} icon="refresh">
            Re-record
          </Button>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const videoStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  borderRadius: 12,
  backgroundColor: '#000',
  aspectRatio: '16/9',
  display: 'block',
};

// ─── NATIVE ──────────────────────────────────────────────────────────────────

function NativeVideoRecorder({ onRecordingComplete, onRecordingCleared }: { onRecordingComplete: (uri: string, blob?: Blob) => void; onRecordingCleared?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pickVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera roll access is required to choose a video.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setRecordedUri(uri);
        onRecordingComplete(uri);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick video');
      console.warn('Video picker failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission is required to record video.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 120,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setRecordedUri(uri);
        onRecordingComplete(uri);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera failed');
      console.warn('Camera failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const reRecord = () => {
    setRecordedUri(null);
    setError('');
    onRecordingCleared?.();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (recordedUri) {
    return (
      <View style={styles.container}>
        <View style={styles.nativeVideoWrap}>
          <Video
            source={{ uri: recordedUri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            style={styles.nativeVideo}
            shouldPlay={false}
          />
        </View>
        <Text style={styles.doneText}>✓ Video recorded</Text>
        <Button mode="outlined" onPress={reRecord} style={styles.btn} icon="refresh">
          Re-record
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={recordVideo} style={styles.btn} icon="video">
        Record Video
      </Button>
      <Button mode="outlined" onPress={pickVideo} style={styles.btn} icon="folder-video">
        Choose from Library
      </Button>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { width: '100%', gap: 12 },
  btn: { borderRadius: 10 },
  btnRecord: { backgroundColor: '#E53935' },
  btnStop: { backgroundColor: '#555' },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E53935' },
  recTimer: { fontSize: 18, fontWeight: 'bold', color: '#1B3A6B', minWidth: 52 },
  doneRow: { gap: 8 },
  doneText: { fontSize: 14, color: '#3DBDA7', fontWeight: '600' },
  error: { color: '#C62828', fontSize: 13, marginTop: 4 },
  nativeVideoWrap: {
    width: '100%',
    maxWidth: 360,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  nativeVideo: { width: '100%', height: 200 },
});
