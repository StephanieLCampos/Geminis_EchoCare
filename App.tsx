import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';
import { echocareTheme } from './src/theme/echocareTheme';

export default function App() {
  return (
    <PaperProvider theme={echocareTheme}>
      <AppNavigator />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
