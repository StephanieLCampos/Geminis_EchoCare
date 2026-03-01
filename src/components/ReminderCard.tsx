import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Reminder } from '../types/models';

interface ReminderCardProps {
  reminder: Reminder;
  onPress?: () => void;
}

export function ReminderCard({ reminder, onPress }: ReminderCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{reminder.title}</Text>
        <Text style={styles.priority}>{reminder.priority.toUpperCase()}</Text>
      </View>
      <Text style={styles.message}>{reminder.messageText}</Text>
      <Text style={styles.meta}>Frequency: {reminder.frequency}</Text>
      <Text style={styles.meta}>Status: {reminder.status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  priority: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  message: {
    fontSize: 22,
    marginTop: 12,
    color: '#0F172A',
  },
  meta: {
    fontSize: 20,
    marginTop: 8,
    color: '#1E293B',
  },
});