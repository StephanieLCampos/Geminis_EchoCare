import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BigButton } from '../components/BigButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createReminder, selectCurrentCaregiver } from '../store/appSlice';
import { generateId } from '../services/storage';
import { Reminder } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'SendReminder'>;

export function SendReminderScreen({ route, navigation }: Props) {
  const caregiver = useAppSelector(selectCurrentCaregiver);
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('Medication Reminder');
  const [messageText, setMessageText] = useState('Please take your evening medicine.');
  const [sourceType, setSourceType] = useState<Reminder['sourceType']>('tts');
  const [frequency, setFrequency] = useState<Reminder['frequency']>('once');
  const [priority, setPriority] = useState<Reminder['priority']>('basic');
  const [medicationName, setMedicationName] = useState('');
  const [responseWindowMinutes, setResponseWindowMinutes] = useState('30');
  const [translatedLanguage, setTranslatedLanguage] = useState('');

  const elder = useMemo(
    () => caregiver?.elders.find((item) => item.id === route.params.elderlyId),
    [caregiver, route.params.elderlyId],
  );

  if (!caregiver || !elder) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Missing caregiver or elder profile</Text>
      </View>
    );
  }

  const handleSend = () => {
    const windowMins = Number(responseWindowMinutes);
    if (!title || !messageText || Number.isNaN(windowMins) || windowMins <= 0) {
      Alert.alert('Invalid input', 'Please complete all required fields.');
      return;
    }

    const now = new Date();
    const dueAt = new Date(now.getTime() + 60 * 1000).toISOString();
    const reminder: Reminder = {
      id: generateId('rem'),
      caregiverId: caregiver.id,
      elderlyId: elder.id,
      title,
      messageText,
      sourceType,
      frequency,
      priority,
      medicationName: medicationName || undefined,
      responseWindowMinutes: windowMins,
      createdAt: now.toISOString(),
      dueAt,
      status: 'pending',
      translatedLanguage: translatedLanguage || undefined,
    };

    dispatch(createReminder(reminder));
    Alert.alert('Reminder sent', `${elder.name} will receive it on their portal.`);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Send to {elder.name}</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
      <TextInput
        style={[styles.input, styles.messageInput]}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Message"
        multiline
      />
      <TextInput style={styles.input} value={sourceType} onChangeText={(text) => setSourceType(text as Reminder['sourceType'])} placeholder="Source: video, tts, audio" />
      <TextInput style={styles.input} value={frequency} onChangeText={(text) => setFrequency(text as Reminder['frequency'])} placeholder="Frequency: once, daily, weekly" />
      <TextInput
        style={styles.input}
        value={priority}
        onChangeText={(text) => setPriority(text as Reminder['priority'])}
        placeholder="Priority: basic, important, emergency"
      />
      <TextInput
        style={styles.input}
        value={medicationName}
        onChangeText={setMedicationName}
        placeholder="Medication name (if applicable)"
      />
      <TextInput
        style={styles.input}
        value={responseWindowMinutes}
        onChangeText={setResponseWindowMinutes}
        keyboardType="numeric"
        placeholder="Response window in minutes"
      />
      <TextInput
        style={styles.input}
        value={translatedLanguage}
        onChangeText={setTranslatedLanguage}
        placeholder="Translate language (optional)"
      />
      <BigButton label="Send Notification" onPress={handleSend} variant="success" />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  input: {
    minHeight: 58,
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 22,
    marginBottom: 10,
  },
  messageInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
});