import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { Loading } from '@/components/common/Loading';
import { useAuthStore } from '@/store';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user, isLoading, initialize } = useAuthStore();
  const [appReady, setAppReady] = React.useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      logger.info('Navigation', 'App initialization started');
      try {
        await initialize();
        logger.info('Navigation', 'Auth initialization complete');
      } catch (error) {
        logger.error('Navigation', 'Auth initialization failed', error);
      } finally {
        setAppReady(true);
        logger.debug('Navigation', 'App ready state set to true');
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    return <Loading fullScreen message="Loading..." />;
  }

  logger.debug('Navigation', 'Rendering navigation', {
    isAuthenticated: !!user,
    userId: user?.id,
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
