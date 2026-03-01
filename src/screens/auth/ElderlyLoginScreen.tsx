import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, TextInput as RNTextInput, ScrollView } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';

interface ElderlyLoginScreenProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onLogin: (accessKey: string) => Promise<unknown>;
}

export function ElderlyLoginScreen({
  onLoginSuccess,
  onBack,
  onLogin,
}: ElderlyLoginScreenProps) {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const key = accessKey.trim().toUpperCase();
    if (key.length !== 6) {
      setError('Please enter a 6-character access key');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onLogin(key);
      onLoginSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.welcomeBadge}>
        <Text style={styles.title}>Welcome! 👋</Text>
      </View>
      <Text style={styles.subtitle}>
        Enter your access key from your caregiver
      </Text>
      <View style={styles.inputWrapper}>
        <RNTextInput
          value={accessKey}
          onChangeText={(t) => {
            setAccessKey(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
            setError('');
          }}
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
          placeholderTextColor="#7A9A9A"
        />
        <Text style={styles.hint}>
          This is a one-time setup. You won't need to sign in again.
        </Text>
      </View>
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading || accessKey.length !== 6}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Start Using App
      </Button>
      <Button mode="text" onPress={onBack} style={styles.backButton}>
        Back
      </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  welcomeBadge: {
    backgroundColor: '#EBF5F5',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 16,
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1B3A6B',
  },
  subtitle: {
    fontSize: 18,
    color: '#7A9A9A',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 48,
  },
  input: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#1B3A6B',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#1B3A6B',
    paddingHorizontal: 16,
  },
  hint: {
    fontSize: 14,
    color: '#7A9A9A',
    textAlign: 'center',
    marginTop: 12,
  },
  button: {
    width: 320,
    borderRadius: 12,
    backgroundColor: '#3DBDA7',
  },
  buttonContent: {
    height: 80,
  },
  backButton: {
    marginTop: 24,
  },
});
