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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useTimerStore, useClientsStore, useProjectsStore, useSettingsStore } from '@/store';
import { formatTime, formatCurrency } from '@/utils/format';

export const TimerScreen = () => {
  const user = useAuthStore((state) => state.user);
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
    updateElapsedSeconds,
  } = useTimerStore();

  const { clients, fetchClients } = useClientsStore();
  const { projects, fetchProjects, getProjectsByClient } = useProjectsStore();
  const { timerPreferences, fetchSettings } = useSettingsStore();

  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchClients(user.id);
      fetchProjects(user.id);
      fetchSettings(user.id);
    }
  }, [user?.id]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      updateElapsedSeconds(elapsedSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, elapsedSeconds]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientProjects = selectedClientId ? getProjectsByClient(selectedClientId) : [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const estimatedEarnings = selectedClient
    ? (elapsedSeconds / 3600) * selectedClient.hourly_rate
    : 0;

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = async () => {
    if (!selectedClientId) {
      Alert.alert('Error', 'Please select a client first');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    start(selectedClientId, selectedProjectId || undefined);
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pause();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resume();
  };

  const handleStop = async () => {
    if (!user?.id || !selectedClient) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'Stop Timer',
        `Save ${formatTime(elapsedSeconds)} for ${selectedClient.name}?`,
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Save', onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmed) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { error } = await stop(
      user.id,
      selectedClient.hourly_rate,
      timerPreferences?.rounding_enabled || false,
      timerPreferences?.rounding_minutes || 15
    );

    if (error) {
      Alert.alert('Error', 'Failed to save time entry');
    } else {
      Alert.alert('Success', 'Time entry saved successfully!');
    }
  };

  const selectClient = (clientId: string) => {
    if (!isRunning) {
      useTimerStore.setState({ selectedClientId: clientId, selectedProjectId: null });
      setIsClientModalVisible(false);
      setSearchQuery('');
    }
  };

  const selectProject = (projectId: string | null) => {
    if (!isRunning) {
      useTimerStore.setState({ selectedProjectId: projectId });
      setIsProjectModalVisible(false);
    }
  };

  if (!user) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Time Tracker</Text>
        </View>

        {/* Timer Display */}
        <Card style={styles.timerCard}>
          <View style={styles.timerDisplay}>
            <Text
              style={[
                styles.timerText,
                isRunning && !isPaused ? styles.timerActive : styles.timerInactive,
              ]}
            >
              {formatTime(elapsedSeconds)}
            </Text>
            {isPaused && (
              <View style={styles.pausedBadge}>
                <Text style={styles.pausedText}>PAUSED</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Client Selector */}
        <Card style={styles.selectorCard}>
          <Text style={styles.label}>CLIENT</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => !isRunning && setIsClientModalVisible(true)}
            disabled={isRunning}
          >
            <View style={styles.selectorContent}>
              {selectedClient ? (
                <>
                  <View>
                    <Text style={styles.selectorText}>{selectedClient.name}</Text>
                    <Text style={styles.selectorSubtext}>
                      {formatCurrency(selectedClient.hourly_rate)}/hr
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>Choose a client...</Text>
              )}
            </View>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Project Selector */}
        {selectedClientId && clientProjects.length > 0 && !isRunning && (
          <Card style={styles.selectorCard}>
            <Text style={styles.label}>PROJECT (OPTIONAL)</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setIsProjectModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                {selectedProject ? (
                  <Text style={styles.selectorText}>{selectedProject.name}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>No project</Text>
                )}
              </View>
              <Text style={styles.selectorArrow}>›</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Running Info & Notes */}
        {isRunning && selectedClient && (
          <Card style={styles.notesCard}>
            <View style={styles.earningsRow}>
              <Text style={styles.clientName}>{selectedClient.name}</Text>
              <Text style={styles.earnings}>{formatCurrency(estimatedEarnings)}</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes (optional)..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
            />
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isRunning ? (
            <Button
              title="START TIMER"
              onPress={handleStart}
              disabled={!selectedClientId}
              size="large"
              style={styles.actionButton}
            />
          ) : (
            <View style={styles.runningActions}>
              {!isPaused ? (
                <Button
                  title="PAUSE"
                  onPress={handlePause}
                  variant="warning"
                  size="large"
                  style={styles.halfButton}
                />
              ) : (
                <Button
                  title="RESUME"
                  onPress={handleResume}
                  variant="success"
                  size="large"
                  style={styles.halfButton}
                />
              )}
              <Button
                title="STOP & SAVE"
                onPress={handleStop}
                variant="danger"
                size="large"
                style={styles.halfButton}
              />
            </View>
          )}
        </View>

        {/* Client Selection Modal */}
        <Modal
          visible={isClientModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsClientModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Client</Text>
              <TouchableOpacity onPress={() => setIsClientModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search clients..."
              placeholderTextColor={theme.colors.placeholder}
            />
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => selectClient(item.id)}
                >
                  <View>
                    <Text style={styles.clientItemName}>{item.name}</Text>
                    <Text style={styles.clientItemRate}>
                      {formatCurrency(item.hourly_rate)}/hr
                    </Text>
                  </View>
                  {selectedClientId === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No clients found</Text>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>

        {/* Project Selection Modal */}
        <Modal
          visible={isProjectModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsProjectModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
              <TouchableOpacity onPress={() => setIsProjectModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: null, name: 'No project' }, ...clientProjects]}
              keyExtractor={(item) => item.id || 'none'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.projectItem}
                  onPress={() => selectProject(item.id as string | null)}
                >
                  <Text style={styles.projectItemName}>{item.name}</Text>
                  {selectedProjectId === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
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
  timerCard: {
    marginBottom: theme.spacing.md,
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    position: 'relative',
  },
  timerText: {
    fontSize: 56,
    fontWeight: theme.fontWeight.bold,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timerActive: {
    color: theme.colors.text,
  },
  timerInactive: {
    color: theme.colors.disabled,
  },
  pausedBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  pausedText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  selectorCard: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  selectorContent: {
    flex: 1,
  },
  selectorText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  selectorSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  selectorPlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.placeholder,
  },
  selectorArrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
  },
  notesCard: {
    marginBottom: theme.spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  clientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  earnings: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 60,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  runningActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalClose: {
    fontSize: theme.fontSize.xxl,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    margin: theme.spacing.lg,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  clientItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  clientItemRate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  projectItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  checkmark: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  emptyList: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
