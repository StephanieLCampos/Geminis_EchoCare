import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SuccessAnimation } from '../components/SuccessAnimation';
import { useAppDispatch } from '../store/hooks';
import { markReminderCompleted } from '../store/appSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'SuccessScreen'>;

export function SuccessScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();

  // Mark completed immediately when this screen mounts, then animate
  React.useEffect(() => {
    dispatch(markReminderCompleted({ reminderId: route.params.reminderId }));
  }, [dispatch, route.params.reminderId]);

  const handleFinish = useCallback(() => {
    navigation.navigate('ElderlyHome');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>You did it!</Text>
        <Text style={styles.subtitle}>Your caregiver has been notified.</Text>
      </View>
      {/* Celebration overlay animates then navigates */}
      <SuccessAnimation onFinish={handleFinish} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 26,
    color: '#000000',
    textAlign: 'center',
  },
});
