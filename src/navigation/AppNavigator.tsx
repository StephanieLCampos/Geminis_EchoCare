import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateState, runEscalationCheck, selectSession } from '../store/appSlice';
import { hydrateStore } from '../store/store';
import { RoleGatewayScreen } from '../screens/RoleGatewayScreen';
import { CreateAccountScreen } from '../screens/CreateAccountScreen';
import { CaregiverLoginScreen } from '../screens/CaregiverLoginScreen';
import { ElderlyLoginScreen } from '../screens/ElderlyLoginScreen';
import { CaregiverHomeScreen } from '../screens/CaregiverHomeScreen';
import { SendReminderScreen } from '../screens/SendReminderScreen';
import { ElderlyHomeScreen } from '../screens/ElderlyHomeScreen';
import { ReminderDetailScreen } from '../screens/ReminderDetailScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { SuccessScreen } from '../screens/SuccessScreen';

export type RootStackParamList = {
  RoleGateway: undefined;
  CreateAccount: undefined;
  CaregiverLogin: undefined;
  ElderlyLogin: undefined;
  CaregiverHome: undefined;
  SendReminder: { elderlyId: string };
  ElderlyHome: undefined;
  ReminderDetail: { reminderId: string };
  InfoScreen: { reminderId: string };
  SuccessScreen: { reminderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSession);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    hydrateStore((data) => {
      dispatch(hydrateState(data));
      dispatch(runEscalationCheck({ nowIso: new Date().toISOString() }));
      setBooting(false);
    });
  }, [dispatch]);

  const initialRoute = useMemo(() => {
    if (session.role === 'caregiver') {
      return 'CaregiverHome';
    }
    if (session.role === 'elderly') {
      return 'ElderlyHome';
    }
    return 'RoleGateway';
  }, [session.role]);

  if (booting) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="RoleGateway" component={RoleGatewayScreen} options={{ title: 'EchoCare' }} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="CaregiverLogin" component={CaregiverLoginScreen} options={{ title: 'Caregiver Sign In' }} />
        <Stack.Screen name="ElderlyLogin" component={ElderlyLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CaregiverHome" component={CaregiverHomeScreen} options={{ title: 'Caregiver Portal' }} />
        <Stack.Screen name="SendReminder" component={SendReminderScreen} options={{ title: 'Send Reminder' }} />
        <Stack.Screen name="ElderlyHome" component={ElderlyHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReminderDetail" component={ReminderDetailScreen} options={{ title: 'Reminder' }} />
        <Stack.Screen name="InfoScreen" component={InfoScreen} options={{ title: 'More Info' }} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});