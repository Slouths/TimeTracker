import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useClientsStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import { formatCurrency, formatTime } from '@/utils/format';
import { logger } from '@/utils/logger';
import type { TimeEntry } from '@/types/models';

export const ReportsScreen = () => {
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalHours: 0,
    totalEntries: 0,
    avgHourlyRate: 0,
  });
  const [clientStats, setClientStats] = useState<
    Array<{
      clientId: string;
      clientName: string;
      hours: number;
      earnings: number;
      entries: number;
    }>
  >([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      await fetchClients(user.id);
      await loadEntries();
    } catch (error) {
      logger.error('Reports', 'Error loading reports', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000);
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const loadEntries = async () => {
    if (!user) return;
    try {
      const { startDate, endDate } = getDateRange();
      const { data } = await databaseService.getTimeEntries(user.id, {
        startDate,
        endDate,
      });

      if (data) {
        setEntries(data);
        calculateStats(data);
      }
    } catch (error) {
      logger.error('Reports', 'Error loading entries', error);
    }
  };

  const calculateStats = (entries: TimeEntry[]) => {
    const totalEarnings = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    const totalHours = totalMinutes / 60;
    const totalEntries = entries.length;
    const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

    setStats({
      totalEarnings,
      totalHours,
      totalEntries,
      avgHourlyRate,
    });

    // Calculate per-client stats
    const clientMap = new Map<
      string,
      { name: string; hours: number; earnings: number; entries: number }
    >();

    entries.forEach((entry) => {
      const existing = clientMap.get(entry.client_id) || {
        name: '',
        hours: 0,
        earnings: 0,
        entries: 0,
      };

      existing.hours += entry.duration_minutes / 60;
      existing.earnings += entry.amount;
      existing.entries += 1;

      const client = clients.find((c) => c.id === entry.client_id);
      if (client) {
        existing.name = client.name;
      }

      clientMap.set(entry.client_id, existing);
    });

    const clientStatsArray = Array.from(clientMap.entries())
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.name,
        hours: data.hours,
        earnings: data.earnings,
        entries: data.entries,
      }))
      .sort((a, b) => b.earnings - a.earnings);

    setClientStats(clientStatsArray);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year', 'all'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === p && styles.periodButtonTextActive,
                ]}
              >
                {p === 'week'
                  ? 'Week'
                  : p === 'month'
                  ? 'Month'
                  : p === 'year'
                  ? 'Year'
                  : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.totalEarnings)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Hours</Text>
            <Text style={styles.statValue}>{stats.totalHours.toFixed(1)}</Text>
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Rate</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.avgHourlyRate)}/hr</Text>
          </Card>
        </View>

        {/* Client Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Breakdown</Text>
          {clientStats.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No data for this period</Text>
            </Card>
          ) : (
            clientStats.map((stat) => (
              <Card key={stat.clientId} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <Text style={styles.clientName}>{stat.clientName}</Text>
                  <Text style={styles.clientEarnings}>{formatCurrency(stat.earnings)}</Text>
                </View>
                <View style={styles.clientStats}>
                  <View style={styles.clientStat}>
                    <Text style={styles.clientStatLabel}>Hours</Text>
                    <Text style={styles.clientStatValue}>{stat.hours.toFixed(1)}</Text>
                  </View>
                  <View style={styles.clientStat}>
                    <Text style={styles.clientStatLabel}>Entries</Text>
                    <Text style={styles.clientStatValue}>{stat.entries}</Text>
                  </View>
                  <View style={styles.clientStat}>
                    <Text style={styles.clientStatLabel}>Rate</Text>
                    <Text style={styles.clientStatValue}>
                      {formatCurrency(stat.hours > 0 ? stat.earnings / stat.hours : 0)}/hr
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Coming Soon: Charts */}
        <Card style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>📊 Charts & Visualizations</Text>
          <Text style={styles.comingSoonText}>
            Time trends, earnings charts, and detailed analytics coming soon!
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  clientCard: {
    padding: 16,
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clientEarnings: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clientStat: {
    alignItems: 'center',
  },
  clientStatLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  clientStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  comingSoonCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
