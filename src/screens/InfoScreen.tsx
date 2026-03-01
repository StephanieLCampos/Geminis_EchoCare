import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppSelector } from '../store/hooks';
import { selectReminders } from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'InfoScreen'>;

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
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: '#3DBDA7',
    alignItems: 'center', justifyContent: 'center',
  },
  mid: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2, borderColor: '#1B3A6B',
    alignItems: 'center', justifyContent: 'center',
  },
  inner: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: '#3DBDA7',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EBF5F5',
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1B3A6B' },
});

export function InfoScreen({ route, navigation }: Props) {
  const reminders = useAppSelector(selectReminders);
  const reminder = reminders.find((item) => item.id === route.params.reminderId);

  if (!reminder) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Info not found.</Text>
      </SafeAreaView>
    );
  }

  const hasImage = !!reminder.medicationImage;
  const pillName = reminder.medicationName || 'N/A';
  const dosage = reminder.medicationDosage || 'N/A';
  const instructions = reminder.messageText || 'Take as directed.';
  const time = new Date(reminder.dueAt).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}><EchoCareLogo /></View>

        <Text style={styles.pageTitle}>{reminder.title}</Text>

        {hasImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: reminder.medicationImage }}
              style={styles.medImage}
              resizeMode="contain"
              accessible
              accessibilityLabel={"Image of " + pillName}
            />
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Pill Name</Text>
            <Text style={styles.value}>{pillName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Dosage</Text>
            <Text style={styles.value}>{dosage}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Instructions</Text>
            <Text style={styles.value}>{instructions}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.doneBtn, pressed && styles.doneBtnPressed]}
          onPress={() => navigation.navigate('SuccessScreen', { reminderId: reminder.id })}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Mark as done"
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48,
  },
  logoWrap: { marginBottom: 4 },
  pageTitle: {
    fontSize: 28, fontWeight: 'bold', color: '#1B3A6B',
    textAlign: 'center', marginTop: 16, marginBottom: 20,
  },
  imageContainer: {
    width: 320, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#EBF5F5', marginBottom: 20,
  },
  medImage: { width: '100%', height: 200 },
  card: {
    width: 320, backgroundColor: '#EBF5F5',
    borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24, marginBottom: 28,
  },
  row: { paddingVertical: 14 },
  label: {
    fontSize: 14, color: '#7A9A9A', fontWeight: '600',
    marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  value: { fontSize: 20, fontWeight: 'bold', color: '#1B3A6B' },
  divider: { height: 1, backgroundColor: '#C5DEDE' },
  doneBtn: {
    width: 320, height: 80, borderRadius: 16,
    backgroundColor: '#3DBDA7', alignItems: 'center', justifyContent: 'center',
  },
  doneBtnPressed: { opacity: 0.82 },
  doneBtnText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
});
