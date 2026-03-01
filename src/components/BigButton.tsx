import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export function BigButton({ label, onPress, variant = 'primary' }: BigButtonProps) {
  const variantStyle = {
    primary: styles.primary,
    secondary: styles.secondary,
    success: styles.success,
    danger: styles.danger,
  }[variant];

  return (
    <Pressable onPress={onPress} style={[styles.base, variantStyle]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#0C4A6E',
  },
  secondary: {
    backgroundColor: '#334155',
  },
  success: {
    backgroundColor: '#166534',
  },
  danger: {
    backgroundColor: '#991B1B',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});