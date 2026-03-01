import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  uri: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ uri, autoPlay = true }: AudioPlayerProps) {
  const sound = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    Audio.Sound.createAsync({ uri })
      .then(({ sound: s }) => {
        if (!mounted) { s.unloadAsync(); return; }
        sound.current = s;
        s.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) { return; }
          setPlaying(status.isPlaying);
        });
        if (autoPlay) { s.playAsync(); }
      })
      .catch(() => { if (mounted) { setError('Could not play audio.'); } });
    return () => {
      mounted = false;
      sound.current?.unloadAsync();
    };
  }, [uri, autoPlay]);

  const handlePlay = () => sound.current?.playAsync();
  const handlePause = () => sound.current?.pauseAsync();
  const handleReplay = () => {
    sound.current?.setPositionAsync(0).then(() => sound.current?.playAsync());
  };

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>🔊 Voice Message</Text>
      <View style={styles.controls}>
        <Pressable
          style={styles.btn}
          onPress={handlePlay}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Play message"
        >
          <Text style={styles.btnText}>▶ Play</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={handlePause}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Pause message"
        >
          <Text style={styles.btnText}>⏸ Pause</Text>
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={handleReplay}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Replay from start"
        >
          <Text style={styles.btnText}>↩ Replay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 22,
    color: '#B71C1C',
    textAlign: 'center',
  },
});
