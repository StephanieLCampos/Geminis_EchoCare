import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';
import type { Elderly } from '../types';
import { colors } from '../theme/colors';

interface ElderlyCardProps {
  elderly: Elderly;
  onPress?: () => void;
  onAddMedication?: () => void;
  onAddReminder?: () => void;
}

export function ElderlyCard({ elderly, onPress, onAddMedication, onAddReminder }: ElderlyCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        {elderly.profileImage ? (
          <Avatar.Image size={60} source={{ uri: elderly.profileImage }} />
        ) : (
          <Avatar.Text
            size={60}
            label={elderly.name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
        )}
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.name}>{elderly.name}</Text>
          {elderly.accessKey && (
            <Text variant="bodySmall" style={styles.relationship}>
              Key: {elderly.accessKey}
            </Text>
          )}
          {(elderly.medications?.length ?? 0) > 0 && (
            <Text variant="bodySmall">
              {elderly.medications?.length} medication(s)
            </Text>
          )}
        </View>
        {(onAddReminder || onAddMedication) && (
          <View style={styles.actions}>
            {onAddReminder && (
              <IconButton icon="bell-plus" onPress={onAddReminder} size={24} />
            )}
            {onAddMedication && (
              <IconButton icon="pill" onPress={onAddMedication} size={24} />
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    backgroundColor: colors.accent,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  relationship: {
    color: colors.muted,
    marginTop: 2,
  },
});
