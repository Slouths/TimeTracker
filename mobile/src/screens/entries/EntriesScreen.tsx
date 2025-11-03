import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import { formatDate, formatDuration, formatCurrency } from '@/utils/format';
import type { TimeEntry } from '@/types/models';

export const EntriesScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadEntries();
    }
  }, [user?.id]);

  const loadEntries = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    const { data } = await databaseService.getTimeEntries(user.id);
    if (data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Entries</Text>
      </View>

      {entries.length === 0 ? (
        <EmptyState
          title="No Time Entries"
          message="Start the timer to create your first entry"
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryClient}>{(item as any).clients?.name || 'Unknown'}</Text>
                <Text style={styles.entryAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={styles.entryDetails}>
                <Text style={styles.entryDate}>{formatDate(item.start_time)}</Text>
                <Text style={styles.entryDuration}>
                  {formatDuration(item.duration_minutes)}
                </Text>
              </View>
              {item.notes && <Text style={styles.entryNotes}>{item.notes}</Text>}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  list: {
    padding: theme.spacing.lg,
  },
  entryCard: {
    marginBottom: theme.spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  entryClient: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  entryAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  entryDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  entryNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
});
