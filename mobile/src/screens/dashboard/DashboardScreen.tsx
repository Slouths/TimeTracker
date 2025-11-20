import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useTimerStore, useClientsStore, useProjectsStore, useSettingsStore } from '@/store';
import { formatTime, formatCurrency } from '@/utils/format';
import { databaseService } from '@/services/supabase/database';
import { logger } from '@/utils/logger';
import type { TimeEntry } from '@/types/models';
import type { DashboardScreenProps } from '@/types/navigation';

export const DashboardScreen: React.FC<DashboardScreenProps<'Dashboard'>> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    isRunning,
    isPaused,
    elapsedSeconds,
    selectedClientId,
    selectedProjectId,
    notes,
    start,
    pause,
    resume,
    stop,
    setNotes,
  } = useTimerStore();

  const { clients, fetchClients } = useClientsStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { userSettings, timerPreferences, fetchSettings } = useSettingsStore();

  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [todayStats, setTodayStats] = useState({ entries: 0, hours: 0, earnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Timer interval to update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const { startTime, totalPausedTime } = useTimerStore.getState();
        if (startTime) {
          const now = new Date();
          const totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const activeSeconds = totalSeconds - totalPausedTime;
          useTimerStore.setState({ elapsedSeconds: activeSeconds });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  const loadData = async () => {
    if (!user) {
      logger.warn('Dashboard', 'No user - skipping data load');
      setIsLoading(false);
      return;
    }
    try {
      logger.info('Dashboard', 'Loading dashboard data', { userId: user.id });
      await Promise.all([
        fetchClients(user.id),
        fetchProjects(user.id),
        fetchSettings(user.id),
        loadRecentEntries(),
        loadTodayStats(),
      ]);
      logger.info('Dashboard', 'Dashboard data loaded');
    } catch (error) {
      logger.error('Dashboard', 'Error loading dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadRecentEntries = async () => {
    if (!user) return;
    try {
      const { data } = await databaseService.getTimeEntries(user.id);
      // Take only the first 5 entries (already sorted by start_time desc in database service)
      setRecentEntries((data || []).slice(0, 5));
    } catch (error) {
      logger.error('Dashboard', 'Error loading recent entries', error);
    }
  };

  const loadTodayStats = async () => {
    if (!user) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data } = await databaseService.getTimeEntries(user.id, {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      });

      if (data) {
        const entries = data.length;
        const minutes = data.reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0);
        const hours = minutes / 60;
        const earnings = data.reduce((sum: number, entry: any) => sum + entry.amount, 0);
        setTodayStats({ entries, hours, earnings });
      }
    } catch (error) {
      logger.error('Dashboard', 'Error loading today stats', error);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const filteredProjects = projects.filter((p) => p.client_id === selectedClientId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleStart = () => {
    if (!selectedClientId) {
      Alert.alert('Select Client', 'Please select a client before starting the timer');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    start(selectedClientId, selectedProjectId || undefined);
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pause();
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resume();
  };

  const handleStop = async () => {
    if (!user || !selectedClient) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await stop(
      user.id,
      selectedClient.hourly_rate,
      timerPreferences?.rounding_enabled || false,
      timerPreferences?.rounding_minutes || 15
    );
    await loadRecentEntries();
    await loadTodayStats();
  };

  const estimatedEarnings = selectedClient
    ? (elapsedSeconds / 3600) * selectedClient.hourly_rate
    : 0;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.entries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.hours.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(todayStats.earnings)}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </Card>
        </View>

        {/* Timer Widget */}
        <Card style={styles.timerCard}>
          <Text style={styles.timerLabel}>Time Tracker</Text>

          {/* Timer Display */}
          <View style={[styles.timerDisplay, isRunning && styles.timerRunning]}>
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
            {isPaused && (
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedText}>PAUSED</Text>
              </View>
            )}
          </View>

          {/* Estimated Earnings */}
          {isRunning && selectedClient && (
            <Text style={styles.earnings}>
              Estimated: {formatCurrency(estimatedEarnings)}
            </Text>
          )}

          {/* Client Selector */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowClientPicker(true)}
            disabled={isRunning}
          >
            <Text style={styles.selectorLabel}>Client</Text>
            <Text style={styles.selectorValue}>
              {selectedClient?.name || 'Select Client'}
            </Text>
          </TouchableOpacity>

          {/* Project Selector */}
          {selectedClientId && filteredProjects.length > 0 && (
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowProjectPicker(true)}
              disabled={isRunning}
            >
              <Text style={styles.selectorLabel}>Project (Optional)</Text>
              <Text style={styles.selectorValue}>
                {selectedProject?.name || 'None'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Notes Input */}
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            editable={!isRunning || isPaused}
          />

          {/* Timer Controls */}
          <View style={styles.controls}>
            {!isRunning ? (
              <Button
                title="Start Timer"
                onPress={handleStart}
                disabled={!selectedClientId}
                style={styles.startButton}
              />
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    title="Pause"
                    onPress={handlePause}
                    variant="secondary"
                    style={styles.controlButton}
                  />
                ) : (
                  <Button
                    title="Resume"
                    onPress={handleResume}
                    style={styles.controlButton}
                  />
                )}
                <Button
                  title="Stop & Save"
                  onPress={handleStop}
                  variant="danger"
                  style={styles.controlButton}
                />
              </>
            )}
          </View>
        </Card>

        {/* Recent Entries */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EntriesTab')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentEntries.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No entries yet. Start tracking!</Text>
            </Card>
          ) : (
            recentEntries.map((entry) => {
              const client = clients.find((c) => c.id === entry.client_id);
              return (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryRow}>
                    <View style={styles.entryLeft}>
                      <Text style={styles.entryClient}>{client?.name}</Text>
                      <Text style={styles.entryTime}>
                        {formatTime(entry.duration_minutes * 60)}
                      </Text>
                    </View>
                    <Text style={styles.entryAmount}>{formatCurrency(entry.amount)}</Text>
                  </View>
                  {entry.notes && (
                    <Text style={styles.entryNotes} numberOfLines={1}>
                      {entry.notes}
                    </Text>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Client Picker Modal */}
      <Modal
        visible={showClientPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowClientPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Client</Text>
              <TouchableOpacity onPress={() => setShowClientPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              value={clientSearch}
              onChangeText={setClientSearch}
              autoFocus
            />
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.id === selectedClientId && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    useTimerStore.setState({ selectedClientId: item.id, selectedProjectId: null });
                    setShowClientPicker(false);
                    setClientSearch('');
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                  <Text style={styles.pickerItemRate}>
                    {formatCurrency(item.hourly_rate)}/hr
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Project Picker Modal */}
      <Modal
        visible={showProjectPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
              <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.pickerItem,
                !selectedProjectId && styles.pickerItemSelected,
              ]}
              onPress={() => {
                useTimerStore.setState({ selectedProjectId: null });
                setShowProjectPicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>None</Text>
            </TouchableOpacity>
            <FlatList
              data={filteredProjects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.id === selectedProjectId && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    useTimerStore.setState({ selectedProjectId: item.id });
                    setShowProjectPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  timerCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  timerDisplay: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timerRunning: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  pausedBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  pausedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  earnings: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  selector: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  selectorValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
  },
  controlButton: {
    flex: 1,
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  viewAllLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  entryCard: {
    padding: 16,
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: {
    flex: 1,
  },
  entryClient: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  entryNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalClose: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  pickerItemRate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
