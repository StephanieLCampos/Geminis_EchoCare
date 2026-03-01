import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import type { Elderly } from '../../types';

interface SelectElderlyForReminderScreenProps {
  onSelect: (elderly: Elderly, tab: 'video' | 'voice') => void;
  onAddElderly: () => void;
  onBack: () => void;
}

export function SelectElderlyForReminderScreen({
  onSelect,
  onAddElderly,
  onBack,
}: SelectElderlyForReminderScreenProps) {
  const [elderly, setElderly] = useState<Elderly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    // Demo mode — inject mock data so the flow is testable without Firebase
    if (!userId) {
      setElderly([
        { id: 'demo-1', name: 'Irene', caregiverId: 'demo', accessKey: 'DEMO01', isActive: true } as Elderly,
        { id: 'demo-2', name: 'Robert', caregiverId: 'demo', accessKey: 'DEMO02', isActive: true } as Elderly,
      ]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'elderly'),
      where('caregiverId', '==', userId),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setElderly(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Elderly)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (elderly.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>No care recipients yet</Text>
          <Text style={styles.emptySubtext}>Add a person first before creating reminders.</Text>
          <Pressable style={styles.addBtn} onPress={onAddElderly}>
            <Text style={styles.addBtnText}>+ Add Care Recipient</Text>
          </Pressable>
          <Pressable onPress={onBack} style={styles.backLink}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a reminder for…</Text>

      <FlatList
        data={elderly}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Avatar + name */}
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name ? item.name[0].toUpperCase() : '?'}
                </Text>
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
            </View>

            {/* Two big buttons */}
            <View style={styles.btnRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Send ${item.name} a video reminder`}
                style={({ pressed }) => [styles.typeBtn, styles.typeBtnVideo, pressed && styles.btnPressed]}
                onPress={() => onSelect(item, 'video')}
              >
                <Text style={styles.typeBtnIcon}>📹</Text>
                <Text style={styles.typeBtnLabel}>Video</Text>
                <Text style={styles.typeBtnHint}>Record your face</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Send ${item.name} a voice message`}
                style={({ pressed }) => [styles.typeBtn, styles.typeBtnVoice, pressed && styles.btnPressed]}
                onPress={() => onSelect(item, 'voice')}
              >
                <Text style={styles.typeBtnIcon}>🎙</Text>
                <Text style={styles.typeBtnLabel}>Voice</Text>
                <Text style={styles.typeBtnHint}>Type → cloned audio</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBF5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B3A6B',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B3A6B',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  typeBtnVideo: {
    backgroundColor: '#1B3A6B',
  },
  typeBtnVoice: {
    backgroundColor: '#3DBDA7',
  },
  btnPressed: {
    opacity: 0.75,
  },
  typeBtnIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  typeBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeBtnHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon:    { fontSize: 52 },
  emptyTitle:   { fontSize: 20, fontWeight: '700', color: '#1B3A6B' },
  emptySubtext: { fontSize: 14, color: '#7A9A9A', textAlign: 'center', lineHeight: 20 },
  addBtn: {
    marginTop: 8,
    backgroundColor: '#3DBDA7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backLink: { marginTop: 8 },
  backText:  { fontSize: 15, color: '#3DBDA7', fontWeight: '600' },
});
