import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardStackNavigator } from '@/navigation/DashboardStackNavigator';
import { EntriesStackNavigator } from '@/navigation/EntriesStackNavigator';
import { ProjectsStackNavigator } from '@/navigation/ProjectsStackNavigator';
import { ReportsStackNavigator } from '@/navigation/ReportsStackNavigator';
import { MoreStackNavigator } from '@/navigation/MoreStackNavigator';
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
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="EntriesTab"
        component={EntriesStackNavigator}
        options={{
          tabBarLabel: 'Entries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⏱️</Text>,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📁</Text>,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsStackNavigator}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⋯</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
