import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SchedulePicker } from '../../components/SchedulePicker';
import { getMedicationsByElderly } from '../../services/elderlyService';
import { previewVoiceClone } from '../../services/voiceService';
import { Audio } from 'expo-av';
import type { ReminderSchedule } from '../../types';
import type { Medication } from '../../types';

const PRIORITIES = ['regular', 'important', 'emergency'] as const;
const CATEGORIES = ['medication', 'daily_task', 'appointment', 'other'] as const;

interface ScheduleScreenProps {
  elderlyId?: string;
  reminderType?: 'video' | 'voice';
  schedule?: Partial<ReminderSchedule>;
  onScheduleComplete: (
    schedule: ReminderSchedule,
    title: string,
    details: {
      priority: string;
      category: string;
      medicationId?: string;
      sourceLanguage?: string;
      targetLanguage?: string;
      responseTimeLimit?: number;
      taskInfo?: string;
    }
  ) => void;
}

export function ScheduleScreen({
  elderlyId,
  reminderType,
  schedule,
  onScheduleComplete,
}: ScheduleScreenProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>('regular');
  const [category, setCategory] = useState<string>('daily_task');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [medicationId, setMedicationId] = useState<string | undefined>();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [responseTimeLimit, setResponseTimeLimit] = useState(30);
  const [taskInfo, setTaskInfo] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [scheduleState, setScheduleState] = useState<ReminderSchedule>(
    schedule && schedule.time
      ? {
          frequency: schedule.frequency ?? 'daily',
          days: schedule.days,
          time: schedule.time,
          timezone: schedule.timezone,
        }
      : { frequency: 'daily', time: '09:00' }
  );

  useEffect(() => {
    if (elderlyId) {
      getMedicationsByElderly(elderlyId).then(setMedications);
    }
  }, [elderlyId]);

  const handleComplete = () => {
    if (!title.trim()) return;
    const valid =
      scheduleState.frequency === 'weekly'
        ? (scheduleState.days?.length ?? 0) > 0
        : true;
    if (!valid) return;
    onScheduleComplete(scheduleState, title.trim(), {
      priority,
      category,
      medicationId,
      sourceLanguage,
      targetLanguage: targetLanguage || undefined,
      responseTimeLimit,
      taskInfo: taskInfo.trim() || undefined,
    });
  };

  const isValid =
    title.trim().length > 0 &&
    (scheduleState.frequency !== 'weekly' ||
      (scheduleState.days?.length ?? 0) > 0);

  const handlePreview = async () => {
    if (!title.trim() || reminderType !== 'voice') return;
    setPreviewing(true);
    try {
      const result = await previewVoiceClone(title.trim());
      const audioUrl = (result as { audioUrl?: string })?.audioUrl;
      if (audioUrl) {
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        await sound.playAsync();
      }
    } catch (err) {
      console.warn('Preview failed:', err);
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Fixed header with Save button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {reminderType === 'voice' ? 'Voice Reminder' : 'Schedule Reminder'}
        </Text>
        <Button
          mode="contained"
          onPress={handleComplete}
          disabled={!isValid}
          style={styles.headerSave}
          labelStyle={styles.headerSaveLabel}
          compact
        >
          Save ✓
        </Button>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.label}>
        {reminderType === 'voice'
          ? 'Message for grandma/grandpa (typed text will be spoken in your voice)'
          : 'Reminder Title'}
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={reminderType === 'voice' ? 'Type your message here...' : 'Enter title'}
        mode="outlined"
        style={styles.input}
        outlineColor="#1B3A6B"
        activeOutlineColor="#3DBDA7"
        textColor="#1B3A6B"
        placeholderTextColor="#7A9A9A"
      />

      <Text style={styles.label}>Importance</Text>
      <View style={styles.chipRow}>
        {(['Important', 'Normal'] as const).map((imp) => {
          const p = imp === 'Important' ? 'important' : 'regular';
          return (
            <Button
              key={p}
              mode={priority === p ? 'contained' : 'outlined'}
              onPress={() => setPriority(p)}
              style={[
                styles.chip,
                priority === p && styles.chipSelected,
              ]}
            >
              {imp}
            </Button>
          );
        })}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            mode={category === c ? 'contained' : 'outlined'}
            compact
            onPress={() => setCategory(c)}
            style={[
              styles.chip,
              category === c && styles.chipSelected,
            ]}
          >
            {c.replace('_', ' ')}
          </Button>
        ))}
      </View>

      {medications.length > 0 && (
        <>
          <Text style={styles.label}>Link to medication (optional)</Text>
          <View style={styles.chipRow}>
            <Button
              mode={!medicationId ? 'contained' : 'outlined'}
              compact
              onPress={() => setMedicationId(undefined)}
              style={[styles.chip, !medicationId && styles.chipSelected]}
            >
              None
            </Button>
            {medications.map((m) => (
              <Button
                key={m.id}
                mode={medicationId === m.id ? 'contained' : 'outlined'}
                compact
                onPress={() => setMedicationId(m.id)}
                style={[styles.chip, medicationId === m.id && styles.chipSelected]}
              >
                {m.name}
              </Button>
            ))}
          </View>
        </>
      )}

      {reminderType === 'voice' && (
        <>
          <Text style={styles.label}>Target language (optional)</Text>
          <TextInput
            value={targetLanguage}
            onChangeText={setTargetLanguage}
            mode="outlined"
            placeholder="e.g. es, fr, hi"
            style={styles.input}
            outlineColor="#1B3A6B"
            activeOutlineColor="#3DBDA7"
            textColor="#1B3A6B"
            placeholderTextColor="#7A9A9A"
          />
        </>
      )}

      {reminderType === 'voice' && title.trim() && (
        <Button
          mode="outlined"
          onPress={handlePreview}
          loading={previewing}
          disabled={previewing}
          style={styles.previewButton}
        >
          Preview Voice Clone
        </Button>
      )}

      <Text style={styles.label}>Schedule</Text>
      <SchedulePicker schedule={schedule} onChange={setScheduleState} />

      <Text style={styles.label}>Timeframe (minutes before emergency contacts notified)</Text>
      <TextInput
        value={String(responseTimeLimit)}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/\D/g, ''), 10);
          if (!isNaN(n)) setResponseTimeLimit(Math.min(120, Math.max(5, n)));
        }}
        keyboardType="number-pad"
        mode="outlined"
        placeholder="30"
        style={styles.input}
        outlineColor="#1B3A6B"
      />

      <Text style={styles.label}>Task information (optional)</Text>
      <TextInput
        value={taskInfo}
        onChangeText={setTaskInfo}
        mode="outlined"
        placeholder="Additional instructions for the elderly..."
        multiline
        numberOfLines={3}
        style={styles.input}
        outlineColor="#1B3A6B"
      />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D0E8E8',
    backgroundColor: '#EBF5F5',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1B3A6B',
  },
  headerSave: {
    backgroundColor: '#1B3A6B',
    borderRadius: 8,
    minWidth: 80,
  },
  headerSaveLabel: {
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  label: {
    fontSize: 14,
    color: '#7A9A9A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: '#1B3A6B',
    borderWidth: 2,
    margin: 2,
  },
  chipSelected: {
    backgroundColor: '#3DBDA7',
    borderColor: '#3DBDA7',
  },
  previewButton: {
    marginTop: 16,
    borderColor: '#1B3A6B',
  },
});
