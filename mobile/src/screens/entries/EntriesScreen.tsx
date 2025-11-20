import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { DatePicker } from '@/components/common/DatePicker';
import { theme } from '@/constants/theme';
import { useAuthStore, useClientsStore, useProjectsStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import { formatDate, formatCurrency } from '@/utils/format';
import { logger } from '@/utils/logger';
import type { TimeEntry } from '@/types/models';

export const EntriesScreen = () => {
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientsStore();
  const { projects, fetchProjects } = useProjectsStore();

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterClient, setFilterClient] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    start_time: new Date(),
    end_time: new Date(),
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, searchQuery, filterClient, filterDateFrom, filterDateTo]);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      await Promise.all([fetchClients(user.id), fetchProjects(user.id), loadEntries()]);
    } catch (error) {
      logger.error('Entries', 'Error loading data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadEntries = async () => {
    if (!user) return;
    try {
      const { data } = await databaseService.getTimeEntries(user.id);
      setEntries(data || []);
    } catch (error) {
      logger.error('Entries', 'Error loading entries', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((entry) => {
        const client = clients.find((c) => c.id === entry.client_id);
        const project = projects.find((p) => p.id === entry.project_id);
        const searchLower = searchQuery.toLowerCase();
        return (
          client?.name.toLowerCase().includes(searchLower) ||
          project?.name.toLowerCase().includes(searchLower) ||
          entry.notes?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Client filter
    if (filterClient) {
      filtered = filtered.filter((entry) => entry.client_id === filterClient);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(
        (entry) => new Date(entry.start_time) >= filterDateFrom
      );
    }
    if (filterDateTo) {
      const endOfDay = new Date(filterDateTo);
      endOfDay.setHours(23, 59, 59);
      filtered = filtered.filter(
        (entry) => new Date(entry.start_time) <= endOfDay
      );
    }

    setFilteredEntries(filtered);
  };

  const handleAdd = () => {
    setEditingEntry(null);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    setFormData({
      client_id: '',
      project_id: '',
      start_time: oneHourAgo,
      end_time: now,
      notes: '',
    });
    setShowModal(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      client_id: entry.client_id,
      project_id: entry.project_id || '',
      start_time: new Date(entry.start_time),
      end_time: new Date(entry.end_time),
      notes: entry.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !formData.client_id) {
      Alert.alert('Error', 'Please select a client');
      return;
    }

    const duration = Math.round(
      (formData.end_time.getTime() - formData.start_time.getTime()) / 60000
    );
    if (duration <= 0) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const client = clients.find((c) => c.id === formData.client_id);
    if (!client) return;

    const amount = (duration / 60) * client.hourly_rate;

    try {
      const entryData = {
        user_id: user.id,
        client_id: formData.client_id,
        project_id: formData.project_id || null,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString(),
        duration_minutes: duration,
        amount,
        notes: formData.notes || null,
      };

      if (editingEntry) {
        await databaseService.updateTimeEntry(editingEntry.id, entryData);
      } else {
        await databaseService.createTimeEntry(entryData);
      }

      await loadEntries();
      setShowModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save entry');
    }
  };

  const handleDelete = (entry: TimeEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteTimeEntry(entry.id);
              await loadEntries();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterClient('');
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setShowFilters(false);
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (filterClient ? 1 : 0) +
    (filterDateFrom ? 1 : 0) +
    (filterDateTo ? 1 : 0);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Entries</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterIcon}>🔍</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Button title="+ New" onPress={handleAdd} style={styles.addButton} />
        </View>
      </View>

      {filteredEntries.length === 0 ? (
        <EmptyState
          title={entries.length === 0 ? 'No Time Entries' : 'No Matches'}
          message={
            entries.length === 0
              ? 'Start the timer or add a manual entry'
              : 'Try adjusting your filters'
          }
          actionLabel={entries.length === 0 ? 'Add Entry' : undefined}
          onAction={entries.length === 0 ? handleAdd : undefined}
        />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const client = clients.find((c) => c.id === item.client_id);
            const project = projects.find((p) => p.id === item.project_id);
            const duration = Math.floor(item.duration_minutes / 60) + 'h ' +
              (item.duration_minutes % 60) + 'm';

            return (
              <Card style={styles.entryCard}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryLeft}>
                      <Text style={styles.entryClient}>{client?.name}</Text>
                      {project && (
                        <Text style={styles.entryProject}>{project.name}</Text>
                      )}
                    </View>
                    <Text style={styles.entryAmount}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDate}>
                      {formatDate(item.start_time)}
                    </Text>
                    <Text style={styles.entryDuration}>{duration}</Text>
                  </View>
                  {item.notes && (
                    <Text style={styles.entryNotes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </TouchableOpacity>
                <View style={styles.actions}>
                  <Button
                    title="Edit"
                    onPress={() => handleEdit(item)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDelete(item)}
                    variant="danger"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEntry ? 'Edit Entry' : 'New Entry'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Client *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Select Client',
                    '',
                    clients.map((client) => ({
                      text: client.name,
                      onPress: () =>
                        setFormData({ ...formData, client_id: client.id, project_id: '' }),
                    }))
                  );
                }}
              >
                <Text style={formData.client_id ? styles.pickerText : styles.pickerPlaceholder}>
                  {clients.find((c) => c.id === formData.client_id)?.name || 'Select client'}
                </Text>
              </TouchableOpacity>

              {formData.client_id && projects.filter((p) => p.client_id === formData.client_id).length > 0 && (
                <>
                  <Text style={styles.label}>Project</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      const clientProjects = projects.filter(
                        (p) => p.client_id === formData.client_id
                      );
                      Alert.alert(
                        'Select Project',
                        '',
                        [
                          { text: 'None', onPress: () => setFormData({ ...formData, project_id: '' }) },
                          ...clientProjects.map((project) => ({
                            text: project.name,
                            onPress: () => setFormData({ ...formData, project_id: project.id }),
                          })),
                        ]
                      );
                    }}
                  >
                    <Text style={formData.project_id ? styles.pickerText : styles.pickerPlaceholder}>
                      {projects.find((p) => p.id === formData.project_id)?.name || 'None'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <DatePicker
                label="Start Time"
                value={formData.start_time}
                onChange={(date) => setFormData({ ...formData, start_time: date })}
                mode="datetime"
                maximumDate={formData.end_time}
              />

              <DatePicker
                label="End Time"
                value={formData.end_time}
                onChange={(date) => setFormData({ ...formData, end_time: date })}
                mode="datetime"
                minimumDate={formData.start_time}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add notes (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Button
                title={editingEntry ? 'Update Entry' : 'Create Entry'}
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Search</Text>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search entries..."
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Client</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Filter by Client',
                    '',
                    [
                      { text: 'All Clients', onPress: () => setFilterClient('') },
                      ...clients.map((client) => ({
                        text: client.name,
                        onPress: () => setFilterClient(client.id),
                      })),
                    ]
                  );
                }}
              >
                <Text style={filterClient ? styles.pickerText : styles.pickerPlaceholder}>
                  {clients.find((c) => c.id === filterClient)?.name || 'All Clients'}
                </Text>
              </TouchableOpacity>

              {filterDateFrom && (
                <DatePicker
                  label="From Date"
                  value={filterDateFrom}
                  onChange={setFilterDateFrom}
                  mode="date"
                />
              )}
              {!filterDateFrom && (
                <Button
                  title="Add Start Date Filter"
                  onPress={() => setFilterDateFrom(new Date())}
                  variant="secondary"
                  style={{ marginBottom: 16 }}
                />
              )}

              {filterDateTo && (
                <DatePicker
                  label="To Date"
                  value={filterDateTo}
                  onChange={setFilterDateTo}
                  mode="date"
                />
              )}
              {!filterDateTo && (
                <Button
                  title="Add End Date Filter"
                  onPress={() => setFilterDateTo(new Date())}
                  variant="secondary"
                  style={{ marginBottom: 16 }}
                />
              )}

              {activeFiltersCount > 0 && (
                <Button
                  title="Clear All Filters"
                  onPress={clearFilters}
                  variant="danger"
                  style={styles.clearButton}
                />
              )}
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: {
    padding: 16,
  },
  entryCard: {
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryLeft: {
    flex: 1,
    marginRight: 12,
  },
  entryClient: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  entryProject: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  entryDuration: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  entryNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
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
    maxHeight: '90%',
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
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalClose: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginTop: 24,
  },
  clearButton: {
    marginTop: 16,
  },
});
