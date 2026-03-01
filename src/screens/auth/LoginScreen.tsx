import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToRegister?: () => void;
  onBack?: () => void;
  onLogin: (email: string, password: string) => Promise<unknown>;
}

export function LoginScreen({
  onLoginSuccess,
  onNavigateToRegister,
  onBack,
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
      onLoginSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
      <View style={styles.welcomeText}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to manage reminders</Text>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          mode="outlined"
          placeholder="Enter your email"
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor="#3DBDA7"
          textColor="#1B3A6B"
          placeholderTextColor="#7A9A9A"
        />
        <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          mode="outlined"
          placeholder="Enter your password"
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor="#3DBDA7"
          textColor="#1B3A6B"
          placeholderTextColor="#7A9A9A"
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.signInButton}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={onNavigateToRegister}>
            <Text style={styles.link}>Create one</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.tagline}>Memory support for the elderly 💙</Text>
      {onBack ? (
        <Button mode="text" onPress={onBack} style={styles.backButton}>
          Back
        </Button>
      ) : null}
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
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  welcomeText: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B3A6B',
  },
  subtitle: {
    fontSize: 16,
    color: '#7A9A9A',
    marginTop: 8,
  },
  formCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#EBF5F5',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B3A6B',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  signInButton: {
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: '#1B3A6B',
  },
  buttonContent: {
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    color: '#7A9A9A',
  },
  link: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3DBDA7',
  },
  tagline: {
    fontSize: 12,
    color: '#7A9A9A',
    marginTop: 48,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
});
