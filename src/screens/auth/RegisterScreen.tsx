/**
 * Multi-step caregiver registration:
 * Step 1: Account + elderly name + voice sample
 * Step 2: Emergency contacts
 * Step 3: Notification sounds
 * Step 4: Setup complete with access key
 */
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { AudioRecorder } from '../../components/AudioRecorder';
import type { EmergencyContact, NotificationSounds } from '../../services/authService';
import { SoundPickerScreen } from '../settings/SoundPickerScreen';
import { createElderly } from '../../services/elderlyService';
import { DEFAULT_REGULAR_ID, DEFAULT_EMERGENCY_ID } from '../../constants/sounds';

type Step = 'account' | 'contacts' | 'sounds' | 'complete';

interface RegisterScreenProps {
  onRegisterSuccess?: () => void;
  onNavigateToLogin?: () => void;
  onBack?: () => void;
  onRegister: (
    email: string,
    password: string,
    name: string,
    voiceFile: Blob | null,
    emergencyContacts: EmergencyContact[],
    notificationSounds: NotificationSounds
  ) => Promise<string>;
}

export function RegisterScreen({
  onRegisterSuccess,
  onNavigateToLogin,
  onBack,
  onRegister,
}: RegisterScreenProps) {
  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [elderlyName, setElderlyName] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [notificationSounds, setNotificationSounds] = useState<NotificationSounds>({
    regular: DEFAULT_REGULAR_ID,
    emergency: DEFAULT_EMERGENCY_ID,
  });
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canProceedFromAccount = () =>
    name.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword &&
    elderlyName.trim() &&
    !!voiceBlob;

  const handleNextFromAccount = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setStep('contacts');
  };

  const handleNextFromContacts = () => {
    setError('');
    setStep('sounds');
  };

  const handleComplete = async () => {
    if (!canProceedFromAccount()) {
      setError('Please fill in all required fields on step 1');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userId = await onRegister(
        email.trim(),
        password,
        name.trim(),
        voiceBlob,
        emergencyContacts,
        notificationSounds
      );
      if (userId && elderlyName.trim()) {
        const { accessKey: key } = await createElderly(userId, elderlyName.trim());
        setAccessKey(key);
      }
      setStep('complete');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Registration error:', msg);
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalComplete = () => {
    onRegisterSuccess?.();
  };

  // Step 4: Setup complete
  if (step === 'complete') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          Setup complete
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Share this access key with {elderlyName || 'your elderly'} for one-time sign-in
        </Text>
        <View style={styles.keyBox}>
          <Text variant="displaySmall" style={styles.keyText}>
            {accessKey}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleFinalComplete}
          style={[styles.button, { backgroundColor: colors.primary }]}
          contentStyle={{ height: 56 }}
        >
          Go to Dashboard
        </Button>
        <Button mode="text" onPress={onNavigateToLogin}>
          Already have an account? Sign in
        </Button>
      </ScrollView>
    );
  }

  const stepTitles: Record<string, string> = {
    account: 'Create account',
    contacts: 'Emergency contacts',
    sounds: 'Notification sounds',
  };

  const nextLabel =
    step === 'account' ? 'Next →' :
    step === 'contacts' ? 'Next →' :
    'Finish';

  const nextAction =
    step === 'account' ? handleNextFromAccount :
    step === 'contacts' ? handleNextFromContacts :
    handleComplete;

  const nextDisabled =
    step === 'account' ? !canProceedFromAccount() :
    step === 'sounds' ? loading :
    false;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fixed header */}
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Button
            mode="text"
            compact
            onPress={step === 'account' ? onBack : () => setStep(step === 'contacts' ? 'account' : 'contacts')}
            style={styles.headerBack}
          >
            ← Back
          </Button>
          <View style={styles.stepIndicator}>
            {(['account', 'contacts', 'sounds'] as const).map((s, i) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  step === s && styles.stepDotActive,
                  ['account', 'contacts', 'sounds'].indexOf(step) > i && styles.stepDotDone,
                ]}
              />
            ))}
          </View>
          <Button
            mode="contained"
            compact
            onPress={nextAction}
            disabled={nextDisabled}
            loading={step === 'sounds' && loading}
            style={styles.headerNext}
            labelStyle={styles.headerNextLabel}
          >
            {nextLabel}
          </Button>
        </View>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠ {error}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
        <Text variant="headlineMedium" style={styles.title}>
          {stepTitles[step]}
        </Text>

        {step === 'account' && (
          <>
            <Text variant="bodySmall" style={styles.subtitle}>
              Your name, email, and the elderly person's name
            </Text>
            <TextInput label="Your name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" style={styles.input} />
            <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry mode="outlined" style={styles.input} />
            <TextInput label="Elderly person's name" value={elderlyName} onChangeText={setElderlyName} mode="outlined" style={styles.input} />
            <Text variant="titleSmall" style={styles.voiceLabel}>
              Voice sample for personalized reminders (required)
            </Text>
            <HelperText type="info" style={styles.voiceHint}>
              Speak naturally for 20–30 seconds. This will be stored and used for all voice messages — you won&apos;t need to record again.
            </HelperText>
            <AudioRecorder onRecordingComplete={(blob) => setVoiceBlob(blob)} />
            {voiceBlob
              ? <HelperText type="info">Voice sample recorded ✓ — ready for account setup</HelperText>
              : <HelperText type="error">Record a voice sample to continue</HelperText>
            }
            {error ? <HelperText type="error">{error}</HelperText> : null}
          </>
        )}

        {step === 'contacts' && (
          <>
            <Text variant="bodySmall" style={styles.subtitle}>
              Add contacts to notify if {elderlyName || 'elderly'} doesn't respond
            </Text>
            <View style={styles.contactSection}>
              <TextInput label="Name" value={newContactName} onChangeText={setNewContactName} mode="outlined" style={styles.contactInput} />
              <TextInput label="Phone" value={newContactPhone} onChangeText={setNewContactPhone} mode="outlined" keyboardType="phone-pad" style={styles.contactInput} />
              <Button
                mode="outlined"
                icon="plus"
                onPress={() => {
                  if (newContactName.trim() && newContactPhone.trim()) {
                    setEmergencyContacts((prev) => [...prev, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
                    setNewContactName('');
                    setNewContactPhone('');
                  }
                }}
              >
                Add contact
              </Button>
            </View>
            {emergencyContacts.map((c, i) => (
              <View key={i} style={styles.contactItem}>
                <Text variant="bodySmall">
                  {c.name} – {c.phone}
                </Text>
                <IconButton icon="close" size={20} onPress={() => setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== i))} />
              </View>
            ))}
          </>
        )}

        {step === 'sounds' && (
          <>
            <Text variant="bodySmall" style={styles.subtitle}>
              Regular chime and emergency sound (from our sound database)
            </Text>
            <SoundPickerScreen
              selectedRegular={notificationSounds.regular}
              selectedEmergency={notificationSounds.emergency}
              onSelect={(regular, emergency) => setNotificationSounds({ regular, emergency })}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.authBg },
  scrollView: { flex: 1 },
  headerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: colors.authBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorBannerText: {
    color: '#C62828',
    fontSize: 13,
  },
  headerBack: { minWidth: 70 },
  stepIndicator: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.accent },
  headerNext: { backgroundColor: colors.primary, borderRadius: 8, minWidth: 80 },
  headerNextLabel: { fontSize: 13 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  title: { marginBottom: 8, color: colors.primary, fontWeight: 'bold' },
  subtitle: { marginBottom: 24, color: colors.muted },
  input: { marginBottom: 12 },
  voiceLabel: { marginTop: 16, marginBottom: 4 },
  voiceHint: { marginBottom: 8 },
  contactSection: { gap: 8 },
  contactInput: { marginBottom: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  keyBox: { padding: 24, backgroundColor: '#EBF5F5', borderRadius: 12, marginVertical: 24, alignItems: 'center' },
  keyText: { fontWeight: 'bold', color: colors.primary, letterSpacing: 4 },
});
