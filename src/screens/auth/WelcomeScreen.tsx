import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { colors } from '../../theme/colors';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onCaregiverSignIn: () => void;
  onElderlySignIn: () => void;
  onVoiceDemo?: () => void;
}

export function WelcomeScreen({
  onCreateAccount,
  onCaregiverSignIn,
  onElderlySignIn,
  onVoiceDemo,
}: WelcomeScreenProps) {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Remind Me logo"
      />
      <Text style={styles.title}>Remind Me</Text>
      <Text style={styles.subtitle}>Memory support for the elderly</Text>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={onCreateAccount}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>
        <Button
          mode="contained"
          onPress={onCaregiverSignIn}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Caregiver Sign In
        </Button>
        <Button
          mode="contained"
          onPress={onElderlySignIn}
          style={[styles.button, styles.accentButton]}
          contentStyle={styles.buttonContent}
        >
          Elderly Sign In
        </Button>
        {onVoiceDemo && (
          <Button
            mode="outlined"
            onPress={onVoiceDemo}
            style={[styles.button, { marginTop: 16 }]}
            contentStyle={styles.buttonContent}
          >
            Try Voice Clone Demo (no Firebase)
          </Button>
        )}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A9A9A',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#1B3A6B',
  },
  accentButton: {
    backgroundColor: '#3DBDA7',
  },
  buttonContent: {
    height: 56,
  },
});
