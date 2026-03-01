import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface VideoPlayerProps {
  uri: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ uri, autoPlay = true }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>Could not play video.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={autoPlay}
        useNativeControls
        onError={() => setError(true)}
        accessible
        accessibilityLabel="Medication instruction video"
      />
      <View style={styles.controls}>
        <Pressable
          style={styles.controlBtn}
          onPress={() => videoRef.current?.playAsync()}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Play video"
        >
          <Text style={styles.controlText}>▶ Play</Text>
        </Pressable>
        <Pressable
          style={styles.controlBtn}
          onPress={() => videoRef.current?.pauseAsync()}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Pause video"
        >
          <Text style={styles.controlText}>⏸ Pause</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: '#1B3A6B',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
    backgroundColor: '#1B3A6B',
  },
  controlBtn: {
    minWidth: 100,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  controlText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorBox: {
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 20,
    color: '#B71C1C',
  },
});
