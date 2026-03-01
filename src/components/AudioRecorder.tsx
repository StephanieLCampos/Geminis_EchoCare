import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Audio } from 'expo-av';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, uri?: string) => void;
}

/** Shows recorded audio with play button - uses expo-av on all platforms */
function RecordedAudioPlayback({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Use the browser's native HTMLAudioElement, not expo-av's Audio namespace
      const audio = new (window as Window & typeof globalThis).Audio(url);
      audio.onplay = () => setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      try {
        await audio.play();
      } catch (e) {
        console.error('Playback failed:', e);
        setPlaying(false);
      }
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && !s.isPlaying) setPlaying(false);
      });
      await sound.playAsync();
    }
  }, [url]);

  return (
    <View style={styles.playbackContainer}>
      <Text variant="labelSmall" style={styles.recordedLabel}>Recorded – play to verify</Text>
      <Button mode="outlined" icon="play" onPress={handlePlay} disabled={playing}>
        {playing ? 'Playing...' : 'Play recording'}
      </Button>
    </View>
  );
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | MediaRecorder | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const clearPlayback = useCallback(() => {
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
  }, [playbackUrl]);

  // Web: MediaRecorder + getUserMedia
  const startRecordingWeb = useCallback(async () => {
    setError(null);
    clearPlayback();
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setPlaybackUrl(url);
          onRecordingComplete?.(blob, url);
        } else {
          setError('Recording was empty. Please try again.');
        }
      };

      mediaRecorder.start(100);
      setRecording(mediaRecorder);

      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setError(msg);
      console.error('Web recording failed:', err);
    }
  }, [onRecordingComplete, clearPlayback]);

  // Native: expo-av
  const startRecordingNative = useCallback(async () => {
    setError(null);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);

      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Recording failed';
      setError(msg);
      console.error('Native recording failed:', err);
    }
  }, []);

  const startRecording = Platform.OS === 'web' ? startRecordingWeb : startRecordingNative;

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (Platform.OS === 'web') {
      const mr = recording as MediaRecorder;
      if (mr.state !== 'inactive') {
        mr.stop();
      }
      setRecording(null);
      setDuration(0);
      return;
    }

    const r = recording as Audio.Recording;
    await r.stopAndUnloadAsync();
    const uri = r.getURI();
    setRecording(null);
    setDuration(0);

    if (uri && onRecordingComplete) {
      const response = await fetch(uri);
      const blob = await response.blob();
      onRecordingComplete(blob, uri);
      setPlaybackUrl(uri);
    }
  }, [recording, onRecordingComplete]);

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">{duration}s / 30s</Text>
      <Button
        mode="contained"
        onPress={recording ? stopRecording : startRecording}
      >
        {recording ? 'Stop' : 'Start Recording'}
      </Button>
      {playbackUrl && (
        <RecordedAudioPlayback url={playbackUrl} />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  playbackContainer: {
    marginTop: 16,
    width: '100%',
    maxWidth: 320,
  },
  recordedLabel: {
    marginBottom: 8,
    color: '#1B3A6B',
    fontWeight: '600',
  },
  error: {
    color: '#c62828',
    fontSize: 12,
  },
});
