import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { addMedication } from '../../services/elderlyService';
import type { Elderly } from '../../types';

interface AddMedicationScreenProps {
  elderly: Elderly;
  onSuccess?: () => void;
}

export function AddMedicationScreen({ elderly, onSuccess }: AddMedicationScreenProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addMedication(elderly.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timeOfDay: timeOfDay.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add medication', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
      <Text variant="titleLarge" style={styles.title}>
        Add Medication for {elderly.name}
      </Text>
      <TextInput
        label="Medication name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Dosage (e.g. 10mg)"
        value={dosage}
        onChangeText={setDosage}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Frequency (e.g. Twice daily)"
        value={frequency}
        onChangeText={setFrequency}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Time of day (e.g. Morning, After breakfast)"
        value={timeOfDay}
        onChangeText={setTimeOfDay}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !name.trim()}
        style={styles.submit}
      >
        Save Medication
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
  input: {
    marginBottom: 12,
  },
  submit: {
    marginTop: 24,
  },
});
