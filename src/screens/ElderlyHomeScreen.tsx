import React, { useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  runEscalationCheck,
  selectCurrentElderly,
  selectReminders,
  selectSession,
  signOut,
} from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'ElderlyHome'>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

function EchoCareLogo() {
  return (
    <View style={logo.outer}>
      <View style={logo.mid}>
        <View style={logo.inner}>
          <View style={logo.dot} />
        </View>
      </View>
    </View>
  );
}

const logo = StyleSheet.create({
  outer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5F5',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1B3A6B',
  },
});

export function ElderlyHomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSession);
  const elderly = useAppSelector(selectCurrentElderly);
  const allReminders = useAppSelector(selectReminders);
  const reminders = allReminders.filter((item) => item.elderlyId === session.elderlyId);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(runEscalationCheck({ nowIso: new Date().toISOString() }));
    }, 30_000);
    dispatch(runEscalationCheck({ nowIso: new Date().toISOString() }));
    return () => clearInterval(interval);
  }, [dispatch]);

  const activeReminder = reminders.find(
    (r) => r.status === 'pending' || r.status === 'missed' || r.status === 'escalated',
  );

  if (!elderly) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.greeting}>No session found.</Text>
      </SafeAreaView>
    );
  }

  const handleStartTask = () => {
    if (!activeReminder) return;
    navigation.navigate('ReminderDetail', { reminderId: activeReminder.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.signOutBtn} onPress={() => { dispatch(signOut()); navigation.reset({ index: 0, routes: [{ name: 'RoleGateway' }] }); }} accessibilityRole="button" accessibilityLabel="Sign out">
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{elderly.name}</Text>

        <View style={styles.logoWrap}>
          <EchoCareLogo />
        </View>

        {activeReminder ? (
          <>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{activeReminder.title}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
              onPress={handleStartTask}
              accessible
              accessibilityRole="button"
              accessibilityLabel={"Start task: " + activeReminder.title}
            >
              <Text style={styles.startBtnText}>Start Task</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneText}>You are all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
    marginTop: 4,
  },
  name: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
  },
  logoWrap: { marginTop: 32, marginBottom: 8 },
  taskCard: {
    width: 320,
    minHeight: 130,
    borderRadius: 20,
    backgroundColor: '#1B3A6B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 36,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  startBtn: {
    width: 320,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#3DBDA7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  startBtnPressed: { opacity: 0.82 },
  startBtnText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  allDoneCard: {
    width: 320,
    borderRadius: 20,
    backgroundColor: '#EBF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 36,
  },
  allDoneText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3A6B',
    textAlign: 'center',
  },
  signOutBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signOutText: {
    fontSize: 14,
    color: '#7A9A9A',
    fontWeight: '600',
  },
});
