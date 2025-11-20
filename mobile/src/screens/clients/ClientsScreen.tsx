import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/constants/theme';
import { useAuthStore, useClientsStore } from '@/store';
import { formatCurrency } from '@/utils/format';

export const ClientsScreen = () => {
  const user = useAuthStore((state) => state.user);
  const { clients, isLoading, fetchClients, addClient, updateClient, deleteClient } =
    useClientsStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchClients(user.id);
    }
  }, [user?.id]);

  const handleOpenModal = (clientId?: string) => {
    if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setEditingClient(clientId);
        setName(client.name);
        setEmail(client.email || '');
        setHourlyRate(client.hourly_rate.toString());
      }
    } else {
      setEditingClient(null);
      setName('');
      setEmail('');
      setHourlyRate('');
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!name || !hourlyRate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Error', 'Please enter a valid hourly rate');
      return;
    }

    if (editingClient) {
      const { error } = await updateClient(editingClient, {
        name,
        email: email || null,
        hourly_rate: rate,
      });
      if (error) {
        Alert.alert('Error', 'Failed to update client');
        return;
      }
    } else {
      const { error } = await addClient({
        user_id: user.id,
        name,
        email: email || null,
        hourly_rate: rate,
      });
      if (error) {
        Alert.alert('Error', 'Failed to add client');
        return;
      }
    }

    setIsModalVisible(false);
    fetchClients(user.id);
  };

  const handleDelete = (clientId: string) => {
    Alert.alert('Delete Client', 'Are you sure? This will delete all associated data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteClient(clientId);
          if (user?.id) fetchClients(user.id);
        },
      },
    ]);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <Button title="Add Client" onPress={() => handleOpenModal()} />
      </View>

      {clients.length === 0 ? (
        <EmptyState
          title="No Clients Yet"
          message="Add your first client to start tracking time"
          actionLabel="Add Client"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{item.name}</Text>
                  {item.email && <Text style={styles.clientEmail}>{item.email}</Text>}
                </View>
                <Text style={styles.clientRate}>{formatCurrency(item.hourly_rate)}/hr</Text>
              </View>
              <View style={styles.clientActions}>
                <TouchableOpacity onPress={() => handleOpenModal(item.id)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingClient ? 'Edit Client' : 'New Client'}
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Input label="Client Name *" value={name} onChangeText={setName} />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Hourly Rate *"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="decimal-pad"
            />
            <Button title="Save Client" onPress={handleSave} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  clientEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clientRate: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  clientActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  deleteText: {
    color: theme.colors.error,
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
  modalContent: {
    padding: theme.spacing.lg,
  },
});
