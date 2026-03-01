import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BigButton } from '../components/BigButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleGateway'>;

export function RoleGatewayScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to EchoCare</Text>
      <Text style={styles.subtitle}>Choose one option to continue</Text>
      <BigButton label="Create Account" onPress={() => navigation.navigate('CreateAccount')} />
      <BigButton
        label="Caregiver Portal Sign In"
        onPress={() => navigation.navigate('CaregiverLogin')}
        variant="secondary"
      />
      <BigButton
        label="Elderly Sign In With Key"
        onPress={() => navigation.navigate('ElderlyLogin')}
        variant="secondary"
      />
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
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 24,
  },
});