import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreScreen } from '@/screens/more/MoreScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { PreferencesScreen } from '@/screens/preferences/PreferencesScreen';
import { SubscriptionScreen } from '@/screens/subscription/SubscriptionScreen';
import { ReferralsScreen } from '@/screens/referrals/ReferralsScreen';
import { InvoicesScreen } from '@/screens/invoices/InvoicesScreen';
import { theme } from '@/constants/theme';
import type { MoreStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export const MoreStackNavigator = () => {
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ title: 'Preferences' }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <Stack.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{ title: 'Referrals' }}
      />
      <Stack.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{ title: 'Invoices' }}
      />
    </Stack.Navigator>
  );
};
