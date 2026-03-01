import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text, List, Button, Divider } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { updateCaregiverVoice } from '../../services/authService';
import type { EmergencyContact } from '../../services/authService';
import { getSoundLabel } from '../../constants/sounds';
import { AudioRecorder } from '../../components/AudioRecorder';

interface SettingsScreenProps {
  onNavigateToContacts?: () => void;
}

export function SettingsScreen({ onNavigateToContacts }: SettingsScreenProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [sounds, setSounds] = useState<{ regular: string; emergency: string }>({
    regular: 'default',
    emergency: 'urgent',
  });
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const loadSettings = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();
    if (data?.emergencyContacts) {
      setContacts(data.emergencyContacts);
    }
    if (data?.notificationSounds) {
      setSounds(data.notificationSounds);
    }
    setHasVoice(!!data?.elevenLabsVoiceId);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleRecordVoice = () => {
    setVoiceError('');
    setRecordedBlob(null);
    setShowRecordModal(true);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const handleSaveVoice = async () => {
    if (!recordedBlob) return;
    setProcessingVoice(true);
    setVoiceError('');
    try {
      await updateCaregiverVoice(recordedBlob);
      setHasVoice(true);
      setRecordedBlob(null);
      setShowRecordModal(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Voice update failed';
      setVoiceError(msg);
      console.warn('Voice update failed:', err);
    } finally {
      setProcessingVoice(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator>
      <List.Section>
        <List.Subheader>Notification Sounds</List.Subheader>
        <List.Item
          title="Regular reminders"
          description={getSoundLabel(sounds.regular, 'regular')}
          left={(props) => <List.Icon {...props} icon="bell" />}
        />
        <List.Item
          title="Emergency alerts"
          description={getSoundLabel(sounds.emergency, 'emergency')}
          left={(props) => <List.Icon {...props} icon="alert" />}
        />
        <List.Item
          title="Change sounds"
          description="Tap to pick from app sound library"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
      </List.Section>
      <Divider />
      <List.Section>
        <List.Subheader>Emergency Contacts</List.Subheader>
        {contacts.map((c, i) => (
          <List.Item
            key={i}
            title={c.name}
            description={`${c.phone}${c.relationship ? ` • ${c.relationship}` : ''}`}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
        ))}
        {contacts.length === 0 && (
          <List.Item
            title="No emergency contacts"
            description="Add during registration"
            left={(props) => <List.Icon {...props} icon="account-off" />}
          />
        )}
      </List.Section>
      <Divider />
      <List.Section>
        <List.Subheader>Voice</List.Subheader>
        {hasVoice === false && (
          <List.Item
            title="No voice on file"
            description="Record a voice sample during account setup or in Settings. Speak naturally for 20–30 seconds."
            descriptionNumberOfLines={3}
            left={(props) => <List.Icon {...props} icon="microphone-off" />}
            right={() => (
              <Button
                mode="contained"
                onPress={handleRecordVoice}
                loading={processingVoice}
                disabled={processingVoice}
                style={styles.recordButton}
              >
                Record
              </Button>
            )}
          />
        )}
        {hasVoice === true && (
          <List.Item
            title="Your voice is set up"
            description="Existing users can update in Settings."
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="microphone" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={handleRecordVoice}
                loading={processingVoice}
                disabled={processingVoice}
              >
                Update
              </Button>
            )}
          />
        )}
        {hasVoice === null && (
          <List.Item
            title="Voice"
            description="Loading..."
            left={(props) => <List.Icon {...props} icon="microphone" />}
          />
        )}
      </List.Section>

      <Modal visible={showRecordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Record voice sample
            </Text>
            <Text variant="bodySmall" style={styles.modalHint}>
              Speak naturally for 20–30 seconds. This will be used for personalized reminders.
            </Text>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            {recordedBlob && (
              <Button
                mode="contained"
                onPress={handleSaveVoice}
                loading={processingVoice}
                disabled={processingVoice}
                style={styles.saveVoiceButton}
              >
                Save voice
              </Button>
            )}
            {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}
            <Button mode="text" onPress={() => setShowRecordModal(false)} style={styles.modalCancel}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  recordButton: {
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  modalHint: {
    color: '#666',
    marginBottom: 16,
  },
  saveVoiceButton: {
    marginTop: 16,
  },
  modalCancel: {
    marginTop: 16,
  },
  voiceError: {
    color: '#c62828',
    fontSize: 12,
    marginTop: 8,
  },
});
