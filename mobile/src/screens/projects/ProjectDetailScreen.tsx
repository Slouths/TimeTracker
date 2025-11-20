import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useProjectsStore, useClientsStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import type { Project, Client, TimeEntry } from '@/types/models';
import type { ProjectsScreenProps } from '@/types/navigation';
import { formatCurrency } from '@/utils/format';

export const ProjectDetailScreen = ({
  route,
  navigation,
}: ProjectsScreenProps<'ProjectDetail'>) => {
  const { projectId } = route.params;
  const { user } = useAuthStore();
  const { updateProject: updateProjectStore } = useProjectsStore();
  const { clients } = useClientsStore();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active' as 'active' | 'completed' | 'on_hold',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    if (!user) return;

    try {
      const [projectRes, entriesRes] = await Promise.all([
        databaseService.getProject(projectId),
        databaseService.getTimeEntries(user.id),
      ]);

      const projectData = projectRes.data;
      setProject(projectData);
      setEntries(entriesRes.data?.filter((e) => e.project_id === projectId) || []);

      // Load client if project has one
      if (projectData?.client_id) {
        const clientRes = await databaseService.getClient(projectData.client_id);
        setClient(clientRes.data);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!project) return;
    setEditForm({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id,
      status: project.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.client_id) {
      Alert.alert('Error', 'Please enter a project name and select a client');
      return;
    }

    try {
      const { error } = await updateProjectStore(projectId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        client_id: editForm.client_id,
        status: editForm.status,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update project');
        return;
      }

      setShowEditModal(false);
      await loadProjectData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update project');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure? This will not delete associated time entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteProject(projectId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleViewClient = () => {
    if (client) {
      navigation.navigate('ClientDetail', { clientId: client.id });
    }
  };

  const totalHours = entries.reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0
  );
  const totalRevenue = entries.reduce(
    (sum, entry) => sum + (entry.billable_amount || 0),
    0
  );

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Project not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Project Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.description && (
            <Text style={styles.description}>{project.description}</Text>
          )}
          {project.hourly_rate && (
            <Text style={styles.rateText}>
              Rate: {formatCurrency(project.hourly_rate)}/hour
            </Text>
          )}
        </Card>

        {/* Client Info */}
        {client && (
          <TouchableOpacity onPress={handleViewClient}>
            <Card style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <View>
                  <Text style={styles.clientLabel}>Client</Text>
                  <Text style={styles.clientName}>{client.name}</Text>
                  {client.company && (
                    <Text style={styles.clientCompany}>{client.company}</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(totalHours)}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatCurrency(totalRevenue)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </Card>
        </View>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Time Entries</Text>
            {entries.slice(0, 10).map((entry) => (
              <View key={entry.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>
                    {entry.description || 'Untitled Entry'}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {entry.start_time
                      ? new Date(entry.start_time).toLocaleDateString()
                      : 'No date'}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemHours}>
                    {entry.duration ? `${Math.round(entry.duration * 10) / 10}h` : 'Active'}
                  </Text>
                  {entry.billable_amount && (
                    <Text style={styles.listItemAmount}>
                      {formatCurrency(entry.billable_amount)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Project"
            onPress={handleEdit}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Delete Project"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Project</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter project name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Client *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert(
                    'Select Client',
                    '',
                    clients.map((c) => ({
                      text: c.name,
                      onPress: () => setEditForm({ ...editForm, client_id: c.id }),
                    }))
                  );
                }}
              >
                <Text style={editForm.client_id ? styles.pickerText : styles.pickerPlaceholder}>
                  {clients.find((c) => c.id === editForm.client_id)?.name || 'Select client'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="Enter description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusButtons}>
                {['active', 'completed', 'on_hold'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      editForm.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      setEditForm({
                        ...editForm,
                        status: status as 'active' | 'completed' | 'on_hold',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        editForm.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Update Project"
                onPress={handleSaveEdit}
                style={styles.saveButton}
              />
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
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  infoCard: {
    margin: 16,
    padding: 20,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  clientCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  clientCompany: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
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
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  listItemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  listItemHours: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  listItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actions: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    width: '100%',
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
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 24,
  },
});
