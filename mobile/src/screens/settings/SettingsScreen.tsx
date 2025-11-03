import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';
import { useBiometric } from '@/hooks/useBiometric';

export const SettingsScreen = () => {
  const { user, signOut } = useAuthStore();
  const { isAvailable, isEnrolled, isEnabled, enableBiometric, disableBiometric } =
    useBiometric();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleToggleBiometric = async () => {
    if (isEnabled) {
      await disableBiometric();
      Alert.alert('Success', 'Biometric authentication disabled');
    } else {
      const success = await enableBiometric();
      if (success) {
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name || 'Not set'}</Text>
          </View>
        </Card>

        {isAvailable && isEnrolled && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <TouchableOpacity style={styles.row} onPress={handleToggleBiometric}>
              <Text style={styles.label}>Biometric Authentication</Text>
              <Text style={[styles.value, isEnabled && styles.enabledText]}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  value: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  enabledText: {
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  signOutButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signOutText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
