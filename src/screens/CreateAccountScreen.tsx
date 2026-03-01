import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigButton } from '../components/BigButton';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AUDIO_CATALOG } from '../constants/audioCatalog';
import { useAppDispatch } from '../store/hooks';
import { createCaregiverAccount, signInCaregiver } from '../store/appSlice';
import { generateElderKey, generateId } from '../services/storage';
import { CaregiverAccount, ElderlyProfile } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;

export function CreateAccountScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [caregiverName, setCaregiverName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [elderName, setElderName] = useState('');
  const [voiceId, setVoiceId] = useState('voice_default');
  const [medicationsRaw, setMedicationsRaw] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [relation, setRelation] = useState('');

  const basicTone = useMemo(() => AUDIO_CATALOG.basic[0].id, []);
  const urgentTone = useMemo(() => AUDIO_CATALOG.urgent[0].id, []);

  const handleCreate = () => {
    if (!caregiverName || !email || !password || !elderName) {
      Alert.alert('Missing info', 'Please fill caregiver and elderly names, email, and password.');
      return;
    }

    const caregiverId = generateId('caregiver');
    const elderly: ElderlyProfile = {
      id: generateId('elderly'),
      name: elderName,
      accessKey: generateElderKey(),
      voiceId,
      medications: medicationsRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => ({
          id: generateId('med'),
          name,
          dosage: 'As prescribed',
        })),
      emergencyContact: {
        name: emergencyName || 'Not set',
        phone: emergencyPhone || 'Not set',
        relation: relation || 'Not set',
      },
      audioPreferences: {
        basicToneId: basicTone,
        urgentToneId: urgentTone,
      },
    };

    const account: CaregiverAccount = {
      id: caregiverId,
      caregiverName,
      email: email.toLowerCase().trim(),
      password,
      elders: [elderly],
    };

    dispatch(createCaregiverAccount(account));
    dispatch(signInCaregiver({ caregiverId }));

    Alert.alert(
      'Account created',
      `Elderly key generated: ${elderly.accessKey}\nShare this key with ${elderly.name}.`,
      [
        {
          text: 'Continue',
          onPress: () => navigation.replace('CaregiverHome'),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Caregiver Setup</Text>
      <TextInput style={styles.input} placeholder="Caregiver name" value={caregiverName} onChangeText={setCaregiverName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.heading}>Add First Elderly</Text>
      <TextInput style={styles.input} placeholder="Elderly name" value={elderName} onChangeText={setElderName} />
      <TextInput style={styles.input} placeholder="ElevenLabs voice id" value={voiceId} onChangeText={setVoiceId} />
      <TextInput
        style={styles.input}
        placeholder="Medications (comma separated)"
        value={medicationsRaw}
        onChangeText={setMedicationsRaw}
      />
      <TextInput style={styles.input} placeholder="Emergency contact name" value={emergencyName} onChangeText={setEmergencyName} />
      <TextInput style={styles.input} placeholder="Emergency contact phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Relation" value={relation} onChangeText={setRelation} />

      <Text style={styles.note}>Default audio profile is saved now. You can extend tone selection from catalog next.</Text>
      <BigButton label="Create Account + Generate Elderly Key" onPress={handleCreate} />
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
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    minHeight: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#94A3B8',
    paddingHorizontal: 14,
    fontSize: 22,
    marginBottom: 10,
  },
  note: {
    fontSize: 18,
    color: '#334155',
    marginVertical: 10,
  },
});