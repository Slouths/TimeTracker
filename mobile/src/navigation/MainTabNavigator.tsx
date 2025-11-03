import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TimerScreen } from '@/screens/timer/TimerScreen';
import { EntriesScreen } from '@/screens/entries/EntriesScreen';
import { ClientsScreen } from '@/screens/clients/ClientsScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { theme } from '@/constants/theme';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="TimerTab"
        component={TimerScreen}
        options={{
          tabBarLabel: 'Timer',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⏱️</Text>,
        }}
      />
      <Tab.Screen
        name="EntriesTab"
        component={EntriesScreen}
        options={{
          tabBarLabel: 'Entries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ClientsScreen}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
