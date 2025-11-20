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
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { theme } from '@/constants/theme';
import { useAuthStore, useClientsStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import type { Client, Project, TimeEntry } from '@/types/models';
import type { ProjectsScreenProps } from '@/types/navigation';
import { formatCurrency } from '@/utils/format';

export const ClientDetailScreen = ({
  route,
  navigation,
}: ProjectsScreenProps<'ClientDetail'>) => {
  const { clientId } = route.params;
  const { user } = useAuthStore();
  const { updateClient: updateClientStore } = useClientsStore();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    hourlyRate: '',
  });

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    if (!user) return;

    try {
      const [clientRes, projectsRes, entriesRes] = await Promise.all([
        databaseService.getClient(clientId),
        databaseService.getProjects(user.id),
        databaseService.getTimeEntries(user.id),
      ]);

      setClient(clientRes.data);
      setProjects(projectsRes.data?.filter((p) => p.client_id === clientId) || []);
      setEntries(entriesRes.data?.filter((e) => e.client_id === clientId) || []);
    } catch (error) {
      console.error('Error loading client data:', error);
      Alert.alert('Error', 'Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!client) return;
    setEditForm({
      name: client.name,
      email: client.email || '',
      hourlyRate: client.hourly_rate.toString(),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.hourlyRate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const rate = parseFloat(editForm.hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Error', 'Please enter a valid hourly rate');
      return;
    }

    try {
      const { error } = await updateClientStore(clientId, {
        name: editForm.name,
        email: editForm.email || null,
        hourly_rate: rate,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update client');
        return;
      }

      setShowEditModal(false);
      await loadClientData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update client');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure? This will not delete associated projects and entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteClient(clientId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete client');
            }
          },
        },
      ]
    );
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

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Client not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Client Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.email && (
            <Text style={styles.infoText}>Email: {client.email}</Text>
          )}
          {client.phone && (
            <Text style={styles.infoText}>Phone: {client.phone}</Text>
          )}
          {client.company && (
            <Text style={styles.infoText}>Company: {client.company}</Text>
          )}
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{projects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </Card>
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

        {/* Projects */}
        {projects.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.listItem}
                onPress={() =>
                  navigation.navigate('ProjectDetail', { projectId: project.id })
                }
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{project.name}</Text>
                  {project.description && (
                    <Text style={styles.listItemSubtitle}>
                      {project.description}
                    </Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            {entries.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>
                    {entry.description || 'Untitled Entry'}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {entry.duration ? `${Math.round(entry.duration)} hours` : 'Active'}
                  </Text>
                </View>
                <Text style={styles.listItemAmount}>
                  {entry.billable_amount
                    ? formatCurrency(entry.billable_amount)
                    : '-'}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Client"
            onPress={handleEdit}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Delete Client"
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
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Client</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Input
              label="Client Name *"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            <Input
              label="Email"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Hourly Rate *"
              value={editForm.hourlyRate}
              onChangeText={(text) => setEditForm({ ...editForm, hourlyRate: text })}
              keyboardType="decimal-pad"
            />
            <Button title="Save Changes" onPress={handleSaveEdit} />
          </View>
        </SafeAreaView>
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
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
  listItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 12,
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    marginLeft: 8,
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
    backgroundColor: theme.colors.background,
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
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  modalContent: {
    padding: 20,
  },
});
