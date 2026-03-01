import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, TextInput, SegmentedButtons } from 'react-native-paper';
import type { ReminderSchedule } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQUENCIES = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

interface SchedulePickerProps {
  schedule?: Partial<ReminderSchedule>;
  onChange: (schedule: ReminderSchedule) => void;
}

export function SchedulePicker({ schedule, onChange }: SchedulePickerProps) {
  const [frequency, setFrequency] = useState<ReminderSchedule['frequency']>(
    schedule?.frequency ?? 'daily'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    schedule?.days ?? []
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    String((schedule as { dayOfMonth?: number })?.dayOfMonth ?? 1)
  );
  const [time, setTime] = useState(schedule?.time ?? '09:00');
  const [startDate, setStartDate] = useState<Date>(
    (schedule as { startDate?: Date })?.startDate ?? new Date()
  );

  const buildSchedule = (updates: Partial<ReminderSchedule> = {}): ReminderSchedule => {
    const f = updates.frequency ?? frequency;
    const dayNum = parseInt(dayOfMonth, 10);
    return {
      frequency: f,
      days: f === 'weekly' ? (updates.days ?? selectedDays) : undefined,
      dayOfMonth: f === 'monthly' ? (updates.dayOfMonth ?? (isNaN(dayNum) ? 1 : dayNum)) : undefined,
      time: updates.time ?? time,
      startDate: f === 'once' ? (updates.startDate ?? startDate) : undefined,
      timezone: schedule?.timezone,
    };
  };

  const handleFrequencyChange = (f: ReminderSchedule['frequency']) => {
    setFrequency(f);
    onChange(buildSchedule({ frequency: f }));
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort((a, b) => a - b);
    setSelectedDays(newDays);
    onChange(buildSchedule({ days: newDays }));
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    onChange(buildSchedule({ time: newTime }));
  };

  const handleDayOfMonthChange = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 1 && n <= 31) {
      setDayOfMonth(v);
      onChange(buildSchedule({ dayOfMonth: n }));
    } else if (v === '') {
      setDayOfMonth(v);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.label}>
        Frequency
      </Text>
      <SegmentedButtons
        buttons={FREQUENCIES.map((f) => ({
          value: f.value,
          label: f.label,
        }))}
        value={frequency ?? 'daily'}
        onValueChange={(v) => handleFrequencyChange((v || 'daily') as ReminderSchedule['frequency'])}
      />
      {frequency === 'weekly' && (
        <>
          <Text variant="titleSmall" style={styles.label}>
            Select days
          </Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, index) => (
              <Chip
                key={day}
                selected={selectedDays.includes(index)}
                onPress={() => toggleDay(index)}
                style={styles.chip}
              >
                {day}
              </Chip>
            ))}
          </View>
        </>
      )}
      {frequency === 'monthly' && (
        <>
          <Text variant="titleSmall" style={styles.label}>
            Day of month (1-31)
          </Text>
          <TextInput
            value={dayOfMonth}
            onChangeText={handleDayOfMonthChange}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />
        </>
      )}
      {frequency === 'once' && (
        <Text variant="bodySmall" style={styles.hint}>
          Will run once at the scheduled time today
        </Text>
      )}
      <Text variant="titleSmall" style={styles.label}>
        Time (HH:MM)
      </Text>
      <TextInput
        value={time}
        onChangeText={handleTimeChange}
        mode="outlined"
        placeholder="09:00"
        keyboardType="numbers-and-punctuation"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    marginTop: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    margin: 2,
  },
  input: {
    maxWidth: 100,
  },
  hint: {
    color: '#666',
    fontStyle: 'italic',
  },
});
