import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsScreen } from '@/screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '@/screens/projects/ProjectDetailScreen';
import { ClientDetailScreen } from '@/screens/clients/ClientDetailScreen';
import { theme } from '@/constants/theme';
import type { ProjectsStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

export const ProjectsStackNavigator = () => {
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
        name="Projects"
        component={ProjectsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Project Details' }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Client Details' }}
      />
    </Stack.Navigator>
  );
};
