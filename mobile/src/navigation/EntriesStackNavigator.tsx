import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EntriesScreen } from '@/screens/entries/EntriesScreen';
import { theme } from '@/constants/theme';
import type { EntriesStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<EntriesStackParamList>();

export const EntriesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Entries"
        component={EntriesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
