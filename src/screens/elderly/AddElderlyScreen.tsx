import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Share } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { createElderly } from '../../services/elderlyService';

interface AddElderlyScreenProps {
  userId: string;
  onSuccess?: () => void;
}

export function AddElderlyScreen({ userId, onSuccess }: AddElderlyScreenProps) {
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAccessKey, setCreatedAccessKey] = useState<string | null>(null);

  const shareKey = async () => {
    if (!createdAccessKey) return;
    try {
      await Share.share({
        message: `Use this code to connect to my care: ${createdAccessKey}\n\nDownload Remind Me to get started.`,
        title: 'Remind Me Access Key',
      });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      let profileImage: Blob | undefined;
      if (photoUri) {
        const response = await fetch(photoUri);
        profileImage = await response.blob();
      }
      const { accessKey } = await createElderly(userId, name.trim(), profileImage);
      setCreatedAccessKey(accessKey);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to add elderly:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setCreatedAccessKey(null);
    setName('');
    setPhotoUri(null);
    onSuccess?.();
  };

  if (createdAccessKey) {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator>
        <Text variant="titleLarge" style={styles.successTitle}>
          Care recipient added!
        </Text>
        <Text variant="bodyLarge" style={styles.keyLabel}>
          Share this 6-character key with them to connect:
        </Text>
        <Text variant="headlineMedium" style={styles.keyDisplay}>
          {createdAccessKey}
        </Text>
        <Button mode="contained" onPress={shareKey} style={styles.submit}>
          Share Key
        </Button>
        <Button mode="outlined" onPress={handleDone} style={styles.doneButton}>
          Done
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator>
      <Text variant="titleLarge" style={styles.title}>
        Add Care Recipient
      </Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="outlined" onPress={pickImage} style={styles.photoButton}>
        {photoUri ? 'Change Photo' : 'Add Photo'}
      </Button>
      {error ? (
        <HelperText type="error" style={styles.error}>{error}</HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !name.trim()}
        style={styles.submit}
      >
        Save
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
  },
  keyLabel: {
    marginBottom: 12,
  },
  keyDisplay: {
    marginBottom: 24,
    letterSpacing: 4,
    textAlign: 'center',
  },
  doneButton: {
    marginTop: 12,
  },
  photoButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  submit: {
    marginTop: 24,
  },
  error: {
    fontSize: 13,
    marginTop: 8,
  },
});
