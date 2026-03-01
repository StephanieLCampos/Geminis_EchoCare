import React, { useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BigButton } from '../components/BigButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCaregivers, signInElderly } from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'ElderlyLogin'>;

const CODE_LENGTH = 6;

export function ElderlyLoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const caregivers = useAppSelector(selectCaregivers);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

  const handleChange = (text: string, index: number) => {
    const char = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError('');
    if (char && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSignIn = () => {
    const accessKey = code.join('');
    if (accessKey.length < CODE_LENGTH) {
      setError('Please enter all 6 characters.');
      return;
    }
    for (const caregiver of caregivers) {
      const elder = caregiver.elders.find((item) => item.accessKey === accessKey);
      if (elder) {
        dispatch(signInElderly({ caregiverId: caregiver.id, elderlyId: elder.id }));
        navigation.replace('ElderlyHome');
        return;
      }
    }
    setError('Invalid code. Please try again.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to EchoCare</Text>
      <Text style={styles.subtitle}>Enter your code below</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref; }}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
            selectTextOnFocus
            accessible
            accessibilityLabel={`Code character ${index + 1}`}
          />
        ))}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <BigButton label="Sign In" onPress={handleSignIn} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 3,
    borderColor: '#1565C0',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  error: {
    fontSize: 20,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 16,
  },
});