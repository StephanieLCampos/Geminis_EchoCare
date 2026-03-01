import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import {
  REGULAR_SOUNDS,
  EMERGENCY_SOUNDS,
  SOUND_ASSETS,
  type SoundOption,
  DEFAULT_REGULAR_ID,
  DEFAULT_EMERGENCY_ID,
} from '../../constants/sounds';

function resolveRegular(val: string): string {
  if (!val) return DEFAULT_REGULAR_ID;
  const byId = REGULAR_SOUNDS.find((s) => s.id === val);
  if (byId) return byId.id;
  const byLabel = REGULAR_SOUNDS.find((s) => s.label === val);
  return byLabel ? byLabel.id : DEFAULT_REGULAR_ID;
}
function resolveEmergency(val: string): string {
  if (!val) return DEFAULT_EMERGENCY_ID;
  const byId = EMERGENCY_SOUNDS.find((s) => s.id === val);
  if (byId) return byId.id;
  const byLabel = EMERGENCY_SOUNDS.find((s) => s.label === val);
  return byLabel ? byLabel.id : DEFAULT_EMERGENCY_ID;
}

interface SoundPickerScreenProps {
  selectedRegular?: string;
  selectedEmergency?: string;
  onSelect: (regular: string, emergency: string) => void;
}

export function SoundPickerScreen({
  selectedRegular,
  selectedEmergency,
  onSelect,
}: SoundPickerScreenProps) {
  const [regular, setRegular] = useState(resolveRegular(selectedRegular ?? ''));
  const [emergency, setEmergency] = useState(resolveEmergency(selectedEmergency ?? ''));
  const currentSoundRef = useRef<Audio.Sound | null>(null);

  const stopCurrentPreview = useCallback(async () => {
    const s = currentSoundRef.current;
    if (s) {
      try {
        await s.stopAsync();
        await s.unloadAsync();
      } catch (_) {}
      currentSoundRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      const s = currentSoundRef.current;
      if (s) {
        s.stopAsync().then(() => s.unloadAsync()).catch(() => {});
      }
    };
  }, []);

  const playPreview = useCallback(async (id: string) => {
    const source = SOUND_ASSETS[id];
    if (source == null) return;
    try {
      await stopCurrentPreview();
      const { sound } = await Audio.Sound.createAsync(source);
      currentSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          if (currentSoundRef.current === sound) currentSoundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (_) {
      currentSoundRef.current = null;
    }
  }, [stopCurrentPreview]);

  const handleRegularChange = (option: SoundOption) => {
    setRegular(option.id);
    onSelect(option.id, emergency);
    playPreview(option.id);
  };

  const handleEmergencyChange = (option: SoundOption) => {
    setEmergency(option.id);
    onSelect(regular, option.id);
    playPreview(option.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
      <Text style={styles.sectionTitle}>Regular Reminder Sound</Text>
      <Text style={styles.hint}>For daily medications and normal reminders</Text>
      {REGULAR_SOUNDS.map((option) => (
        <Pressable
          key={option.id}
          style={[
            styles.soundButton,
            regular === option.id && styles.soundButtonSelected,
          ]}
          onPress={() => handleRegularChange(option)}
        >
          <Text style={[styles.soundText, regular === option.id && styles.soundTextSelected]}>
            {option.label}
          </Text>
          <Text style={styles.soundIcon}>🔊</Text>
        </Pressable>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
        Important/Emergency Sound
      </Text>
      <Text style={styles.hint}>For urgent reminders and emergencies</Text>
      {EMERGENCY_SOUNDS.map((option) => (
        <Pressable
          key={option.id}
          style={[
            styles.soundButton,
            emergency === option.id && styles.soundButtonSelected,
          ]}
          onPress={() => handleEmergencyChange(option)}
        >
          <Text style={[styles.soundText, emergency === option.id && styles.soundTextSelected]}>
            {option.label}
          </Text>
          <Text style={styles.soundIcon}>🚨</Text>
        </Pressable>
      ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3A6B',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#7A9A9A',
    marginBottom: 12,
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1B3A6B',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  soundButtonSelected: {
    backgroundColor: '#3DBDA7',
    borderColor: '#3DBDA7',
  },
  soundText: {
    fontSize: 14,
    color: '#1B3A6B',
  },
  soundTextSelected: {
    color: '#FFFFFF',
  },
  soundIcon: {
    fontSize: 18,
  },
});
