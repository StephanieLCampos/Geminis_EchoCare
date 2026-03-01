import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BigButton } from '../components/BigButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCaregivers, signInCaregiver } from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'CaregiverLogin'>;

export function CaregiverLoginScreen({ navigation }: Props) {
  const caregivers = useAppSelector(selectCaregivers);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    const caregiver = caregivers.find(
      (item) => item.email === email.toLowerCase().trim() && item.password === password,
    );
    if (!caregiver) {
      Alert.alert('Invalid login', 'Email or password is incorrect.');
      return;
    }
    dispatch(signInCaregiver({ caregiverId: caregiver.id }));
    navigation.replace('CaregiverHome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caregiver Sign In</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <BigButton label="Sign In" onPress={handleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 16,
    color: '#0F172A',
  },
  input: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 22,
    marginBottom: 12,
  },
});