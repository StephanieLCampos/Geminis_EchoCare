import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, FAB } from 'react-native-paper';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import type { Reminder } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  sent: 'Sent',
  acknowledged: 'Done',
  escalated: 'Escalated',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#1565C0',
  sent: '#2E7D32',
  acknowledged: '#558B2F',
  escalated: '#C62828',
};

interface RemindersListScreenProps {
  onNavigateToHome?: () => void;
}

export function RemindersListScreen({ onNavigateToHome }: RemindersListScreenProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, 'reminders'),
      where('caregiverId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reminder[];
      setReminders(list.sort((a, b) => {
        const aTime = (a.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
        const bTime = (b.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
        return bTime - aTime;
      }));
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        My Reminders
      </Text>
      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">No reminders yet.</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Create one from a care recipient's card
          </Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium">{item.title}</Text>
                  <Chip
                    style={{
                      backgroundColor: STATUS_COLORS[item.status ?? ''] ?? '#666',
                    }}
                    textStyle={styles.statusText}
                  >
                    {STATUS_LABELS[item.status ?? ''] ?? item.status}
                  </Chip>
                </View>
                <Text variant="bodySmall" style={styles.meta}>
                  {item.type} • {item.priority} • {item.category}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
      {onNavigateToHome && (
        <FAB
          icon="home"
          style={styles.fab}
          onPress={onNavigateToHome}
          label="Back to Home"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5F5',
  },
  title: {
    padding: 16,
    paddingBottom: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#1B3A6B',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  meta: {
    marginTop: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
