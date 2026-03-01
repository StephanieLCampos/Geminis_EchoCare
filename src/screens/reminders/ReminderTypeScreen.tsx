import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, RadioButton } from 'react-native-paper';

type ReminderType = 'video' | 'voice';

interface ReminderTypeScreenProps {
  selectedType?: ReminderType;
  onSelect: (type: ReminderType) => void;
}

export function ReminderTypeScreen({ selectedType, onSelect }: ReminderTypeScreenProps) {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator>
      <Text variant="titleLarge" style={styles.title}>
        Choose reminder type
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Video reminders show your face. Voice reminders use a cloned voice.
      </Text>
      <RadioButton.Group onValueChange={(v) => onSelect(v as ReminderType)} value={selectedType ?? ''}>
        <Card style={styles.card} onPress={() => onSelect('video')}>
          <Card.Content>
            <View style={styles.option}>
              <RadioButton value="video" />
              <View>
                <Text variant="titleMedium">Video Reminder</Text>
                <Text variant="bodySmall">Record a video message they'll see</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.card} onPress={() => onSelect('voice')}>
          <Card.Content>
            <View style={styles.option}>
              <RadioButton value="voice" />
              <View>
                <Text variant="titleMedium">Voice Reminder</Text>
                <Text variant="bodySmall">Clone your voice for audio reminders</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </RadioButton.Group>
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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    color: '#666',
  },
  card: {
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
