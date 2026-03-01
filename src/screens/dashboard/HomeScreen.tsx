import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { getElderlyByUser } from '../../services/elderlyService';
import type { Reminder } from '../../types';
import type { Elderly } from '../../types';

interface HomeScreenProps {
  onAddElderly?: () => void;
  onAddMedication?: (elderly: Elderly) => void;
  onAddReminder?: (elderly: Elderly) => void;
  onCreateReminder?: () => void;
  onViewReminders?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
  onElderlyPress?: (elderly: Elderly) => void;
  onElderlyVoicePress?: (elderly: Elderly) => void;
}

function getDisplayTime(schedule: Reminder['schedule']): string {
  if (typeof schedule === 'object' && schedule && 'time' in schedule) {
    const t = (schedule as { time?: string }).time;
    if (t) {
      const [h, m] = t.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    }
  }
  return '—';
}

function getStatusBadge(reminder: Reminder): { label: string; color: string } {
  const status = reminder.status ?? 'scheduled';
  if (status === 'acknowledged') return { label: '✓ Done', color: '#3DBDA7' };
  if (status === 'escalated') return { label: '⚠ Not Answered', color: '#FF4444' };
  if (status === 'sent') return { label: '⏱ Pending', color: '#FFB84D' };
  return { label: '⏱ Pending', color: '#FFB84D' };
}

export function HomeScreen({
  onAddElderly,
  onCreateReminder,
  onViewReminders,
  onSettings,
  onSignOut,
  onElderlyPress,
  onElderlyVoicePress,
}: HomeScreenProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userName, setUserName] = useState('Caregiver');
  const [elderly, setElderly] = useState<Elderly[]>([]);

  // ── Scheduled reminder delivery ───────────────────────────────────────────
  // Runs every 30 s and flips any due reminders from 'scheduled' → 'sent'.
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const fireReminders = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const now = new Date();
      try {
        const snap = await getDocs(
          query(
            collection(db, 'reminders'),
            where('caregiverId', '==', userId),
            where('status', '==', 'scheduled'),
          )
        );
        snap.forEach(async (docSnap) => {
          const schedule = docSnap.data().schedule;
          if (!schedule) return;
          let isDue = false;
          if (schedule.startDate) {
            const fireAt = schedule.startDate.toDate
              ? schedule.startDate.toDate()
              : new Date(schedule.startDate.seconds
                  ? schedule.startDate.seconds * 1000
                  : schedule.startDate);
            isDue = fireAt <= now;
          }
          if (schedule.sendNow || schedule.type === 'immediate') isDue = true;
          if (isDue) {
            await updateDoc(doc(db, 'reminders', docSnap.id), {
              status: 'sent',
              sentAt: now,
            });
            console.log(`[Scheduler] Delivered: "${docSnap.data().title}"`);
          }
        });
      } catch (err) {
        console.warn('[Scheduler]', err);
      }
    };

    // Run immediately then every 30 seconds
    fireReminders();
    schedulerRef.current = setInterval(fireReminders, 30_000);
    return () => {
      if (schedulerRef.current) clearInterval(schedulerRef.current);
    };
  }, []);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Caregiver';
    setUserName(displayName);

    getElderlyByUser(userId).then(setElderly).catch(() => setElderly([]));

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
      {/* Navy header - full width, 90px */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Remember Me</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerGreeting}>Hi, {userName} 👋</Text>
          <View style={styles.headerIcons}>
            <IconButton icon="bell" iconColor="#FFFFFF" size={22} onPress={onViewReminders} />
            <IconButton icon="cog" iconColor="#FFFFFF" size={22} onPress={onSettings} />
            <IconButton icon="logout" iconColor="#FFFFFF" size={22} onPress={onSignOut} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        {/* Care Recipients */}
        {elderly.length > 0 && (
          <View style={styles.elderlySection}>
            <Text style={styles.sectionLabel}>Your Care Recipients</Text>
            <Text style={styles.elderlyHint}>Choose how to send a reminder</Text>
            <View style={styles.elderlyCards}>
              {elderly.map((e) => (
                <View key={e.id} style={styles.elderlyCard}>
                  <View style={styles.elderlyAvatar}>
                    <Text style={styles.elderlyAvatarText}>
                      {e.name ? e.name[0].toUpperCase() : '?'}
                    </Text>
                  </View>
                  <Text style={styles.elderlyCardName} numberOfLines={1}>{e.name}</Text>
                  <View style={styles.chipRow}>
                    <Pressable
                      style={({ pressed }) => [styles.videoChip, pressed && styles.chipPressed]}
                      onPress={() => onElderlyPress?.(e)}
                    >
                      <Text style={styles.videoChipText}>📹 Video</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.voiceChip, pressed && styles.chipPressed]}
                      onPress={() => onElderlyVoicePress?.(e)}
                    >
                      <Text style={styles.voiceChipText}>🎙 Voice</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileMeta}>{reminders.length} reminders today</Text>
          </View>
          <Pressable style={styles.addButton} onPress={onAddElderly}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        {/* Create Reminder button */}
        <Button
          mode="contained"
          onPress={onCreateReminder ?? onViewReminders}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
        >
          + Create Reminder
        </Button>

        {/* Today's Reminders */}
        <Text style={styles.sectionTitle}>Today's Reminders</Text>
        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>Create one to get started</Text>
          </View>
        ) : (
          reminders.slice(0, 20).map((reminder) => {
            const badge = getStatusBadge(reminder);
            const isOverdue = reminder.status === 'escalated';
            return (
              <View
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  isOverdue && styles.reminderCardOverdue,
                ]}
              >
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderTitleWrap}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderTime}>
                      {getDisplayTime(reminder.schedule)}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <Text style={styles.badgeText}>{badge.label}</Text>
                  </View>
                </View>
                <View style={styles.reminderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{reminder.type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Timeframe:</Text>
                    <Text style={styles.detailValue}>{reminder.responseTimeLimit ?? 60} min</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Importance:</Text>
                    <View style={[
                      styles.importanceBadge,
                      reminder.priority === 'high' && styles.importanceHigh,
                    ]}>
                      <Text style={[
                        styles.importanceText,
                        reminder.priority === 'high' && styles.importanceTextHigh,
                      ]}>
                        {reminder.priority === 'high' ? 'Important' : 'Normal'}
                      </Text>
                    </View>
                  </View>
                  {reminder.status === 'acknowledged' && reminder.acknowledgedAt && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Completed:</Text>
                      <Text style={styles.completedValue}>
                        {new Date(reminder.acknowledgedAt as string).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
                {isOverdue && (
                  <View style={styles.overdueBanner}>
                    <Text style={styles.overdueText}>
                      No response within {reminder.responseTimeLimit ?? 60} minutes
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5F5',
  },
  header: {
    width: '100%',
    height: 90,
    backgroundColor: '#1B3A6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    flexGrow: 1,
  },
  elderlySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 4,
  },
  elderlyHint: {
    fontSize: 12,
    color: '#7A9A9A',
    marginBottom: 12,
  },
  elderlyCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  elderlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E6F0F0',
  },
  elderlyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  elderlyAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  elderlyCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 10,
    maxWidth: 110,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  videoChip: {
    backgroundColor: '#1B3A6B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  videoChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  voiceChip: {
    backgroundColor: '#3DBDA7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  voiceChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipPressed: {
    opacity: 0.7,
  },
  profileCard: {
    width: 320,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3DBDA7',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3A6B',
  },
  profileMeta: {
    fontSize: 14,
    color: '#7A9A9A',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  createButton: {
    width: 320,
    marginTop: 32,
    borderRadius: 8,
    backgroundColor: '#1B3A6B',
  },
  createButtonContent: {
    height: 56,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3A6B',
    marginTop: 32,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A6B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7A9A9A',
    marginTop: 8,
  },
  reminderCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  reminderCardOverdue: {
    borderWidth: 2,
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderTitleWrap: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A6B',
  },
  reminderTime: {
    fontSize: 14,
    color: '#7A9A9A',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reminderDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EBF5F5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7A9A9A',
  },
  detailValue: {
    fontSize: 12,
    color: '#1B3A6B',
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  importanceHigh: {
    backgroundColor: '#FFF5F5',
  },
  importanceText: {
    fontSize: 12,
    color: '#7A9A9A',
  },
  importanceTextHigh: {
    color: '#FF4444',
  },
  completedValue: {
    fontSize: 12,
    color: '#3DBDA7',
  },
  overdueBanner: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  overdueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
  },
});
