import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { MemoProvider, useMemoContext } from './src/contexts/MemoContext';
import { isSecurityEnabled, isOnboarded, lockApp } from './src/services/SecurityService';
import LockScreen from './src/screens/LockScreen';

// Helper component to access context for StatusBar
const ThemedStatusBar = () => {
  const { theme } = useMemoContext();
  // If background is light, use dark text, else light text
  const statusBarStyle = theme.colors.statusBarStyle || 'auto';
  return <StatusBar style={statusBarStyle} />;
};

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const onboarded = await isOnboarded();
        setInitialRoute(onboarded ? 'Main' : 'Welcome');

        const securityEnabled = await isSecurityEnabled();
        if (securityEnabled && onboarded) {
          setIsLocked(true);
        }
      } catch (e) {
        console.error('App Init Error:', e);
        setInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background') {
        const securityEnabled = await isSecurityEnabled();
        if (securityEnabled) {
          lockApp();
          setIsLocked(true);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  if (isLoading) return null;

  return (
    <SafeAreaProvider>
      <MemoProvider>
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
        <RootNavigator initialRouteName={initialRoute} />
        <ThemedStatusBar />
      </MemoProvider>
    </SafeAreaProvider>
  );
}
