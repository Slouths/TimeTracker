import React, { useState, useEffect } from 'react';
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
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useProjectsStore, useClientsStore } from '@/store';
import { formatCurrency } from '@/utils/format';
import { logger } from '@/utils/logger';
import type { Project } from '@/types/models';
import type { ProjectsScreenProps } from '@/types/navigation';

export const ProjectsScreen = ({ navigation }: ProjectsScreenProps<'Projects'>) => {
  const { user } = useAuthStore();
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjectsStore();
  const { clients, fetchClients } = useClientsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active' as 'active' | 'completed' | 'on_hold',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      await Promise.all([fetchProjects(user.id), fetchClients(user.id)]);
    } catch (error) {
      logger.error('Projects', 'Error loading projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      client_id: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id,
      status: project.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }
    if (!formData.client_id) {
      Alert.alert('Error', 'Please select a client');
      return;
    }

    try {
      const projectData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        client_id: formData.client_id,
        status: formData.status,
        budget_hours: null,
        color: null,
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await addProject(projectData);
      }

      setShowModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save project');
    }
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.primary;
      case 'on_hold':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Button title="New Project" onPress={handleAdd} style={styles.addButton} />
      </View>

      {projects.length === 0 ? (
        <EmptyState
          title="No Projects"
          message="Create your first project to organize your work"
          actionLabel="Add Project"
          onAction={handleAdd}
        />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const client = clients.find((c) => c.id === item.client_id);
            return (
              <Card style={styles.projectCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                >
                  <View style={styles.projectHeader}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{item.name}</Text>
                      <Text style={styles.clientName}>{client?.name}</Text>
                    </View>
                    <View style={styles.projectStatus}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusBadgeColor(item.status)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusBadgeColor(item.status) },
                          ]}
                        >
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </View>
                  {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
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
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                {editingProject ? 'Edit Project' : 'New Project'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter project name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Client *</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => {
                    Alert.alert(
                      'Select Client',
                      '',
                      clients.map((client) => ({
                        text: client.name,
                        onPress: () => setFormData({ ...formData, client_id: client.id }),
                      }))
                    );
                  }}
                >
                  <Text style={formData.client_id ? styles.pickerText : styles.pickerPlaceholder}>
                    {clients.find((c) => c.id === formData.client_id)?.name || 'Select client'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                      formData.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        status: status as 'active' | 'completed' | 'on_hold',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={editingProject ? 'Update Project' : 'Create Project'}
                onPress={handleSave}
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
  },
  projectCard: {
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  projectStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  budget: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 8,
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
