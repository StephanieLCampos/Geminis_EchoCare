import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BigButton } from '../components/BigButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addElderlyToCaregiver, selectCurrentCaregiver, signOut } from '../store/appSlice';
import { generateElderKey, generateId } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'CaregiverHome'>;

export function CaregiverHomeScreen({ navigation }: Props) {
  const caregiver = useAppSelector(selectCurrentCaregiver);
  const dispatch = useAppDispatch();

  const [showAddElder, setShowAddElder] = useState(false);
  const [elderName, setElderName] = useState('');
  const [voiceId, setVoiceId] = useState('voice_default');

  if (!caregiver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No active caregiver session</Text>
        <BigButton label="Back to Start" onPress={() => navigation.replace('RoleGateway')} />
      </View>
    );
  }

  const handleAddElder = () => {
    if (!elderName) {
      Alert.alert('Missing name', 'Please enter elder name.');
      return;
    }
    const key = generateElderKey();
    dispatch(
      addElderlyToCaregiver({
        caregiverId: caregiver.id,
        elderly: {
          id: generateId('elderly'),
          name: elderName,
          accessKey: key,
          voiceId,
          medications: [],
          emergencyContact: {
            name: 'Not set',
            phone: 'Not set',
            relation: 'Not set',
          },
          audioPreferences: {
            basicToneId: 'basic_soft_bell',
            urgentToneId: 'urgent_clear_alert',
          },
        },
      }),
    );
    setElderName('');
    setShowAddElder(false);
    Alert.alert('Elder added', `New key generated: ${key}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {caregiver.caregiverName}</Text>
      <Text style={styles.subtitle}>Manage linked elders and send reminders.</Text>

      {showAddElder ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Add Another Elder</Text>
          <TextInput style={styles.input} value={elderName} onChangeText={setElderName} placeholder="Elder name" />
          <TextInput style={styles.input} value={voiceId} onChangeText={setVoiceId} placeholder="Voice id" />
          <BigButton label="Create Key" onPress={handleAddElder} />
        </View>
      ) : (
        <BigButton label="Add Another Elder" onPress={() => setShowAddElder(true)} variant="secondary" />
      )}

      <FlatList
        style={styles.list}
        data={caregiver.elders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.elderCard}>
            <Text style={styles.elderName}>{item.name}</Text>
            <Text style={styles.elderMeta}>Key: {item.accessKey}</Text>
            <BigButton
              label="Send Reminder"
              onPress={() => navigation.navigate('SendReminder', { elderlyId: item.id })}
              variant="success"
            />
          </View>
        )}
      />

      <BigButton
        label="Sign Out"
        variant="danger"
        onPress={() => {
          dispatch(signOut());
          navigation.replace('RoleGateway');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 21,
    color: '#334155',
    marginBottom: 12,
  },
  panel: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1E293B',
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
  list: {
    flex: 1,
    marginTop: 8,
  },
  elderCard: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  elderName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  elderMeta: {
    fontSize: 20,
    color: '#334155',
    marginVertical: 4,
  },
});