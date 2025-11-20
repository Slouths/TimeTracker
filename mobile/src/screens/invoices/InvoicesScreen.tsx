import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { DatePicker } from '@/components/common/DatePicker';
import { theme } from '@/constants/theme';
import { useAuthStore, useClientsStore } from '@/store';
import { databaseService } from '@/services/supabase/database';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Invoice, TimeEntry } from '@/types/models';

export const InvoicesScreen = () => {
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientsStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableEntries, setAvailableEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    client_id: '',
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      await Promise.all([loadInvoices(), fetchClients(user.id)]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadInvoices = async () => {
    if (!user) return;
    try {
      const { data } = await databaseService.getInvoices(user.id);
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenInvoiceForm = () => {
    // Show a simple modal to select client first
    Alert.alert(
      'Create Invoice',
      'Select a client to create an invoice for:',
      clients.map((client) => ({
        text: client.name,
        onPress: async () => {
          setFormData({ ...formData, client_id: client.id });
          // Load unbilled entries for the selected client
          const { data: entries } = await databaseService.getTimeEntries(user!.id, {
            clientId: client.id,
          });
          const unbilledEntries = (entries || []).filter((e) => !e.invoice_id);
          if (unbilledEntries.length === 0) {
            Alert.alert('No Entries', 'This client has no unbilled time entries.');
            return;
          }
          setAvailableEntries(unbilledEntries);
          setSelectedEntries(new Set(unbilledEntries.map((e) => e.id)));
          setShowCreateModal(true);
        },
      }))
    );
  };

  const handleSaveInvoice = async () => {
    if (!user || selectedEntries.size === 0) {
      Alert.alert('Error', 'Please select at least one time entry');
      return;
    }

    try {
      const selectedEntriesArray = availableEntries.filter((e) =>
        selectedEntries.has(e.id)
      );
      const total = selectedEntriesArray.reduce((sum, e) => sum + e.amount, 0);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const { data: invoice, error } = await databaseService.createInvoice({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber,
        issue_date: formData.issue_date.toISOString(),
        due_date: formData.due_date.toISOString(),
        subtotal: total,
        tax: 0,
        total,
        status: 'draft',
        notes: formData.notes || null,
      });

      if (error || !invoice) {
        Alert.alert('Error', 'Failed to create invoice');
        return;
      }

      // Update time entries with invoice_id
      for (const entryId of selectedEntries) {
        await databaseService.updateTimeEntry(entryId, {
          invoice_id: invoice.id,
        });
      }

      setShowCreateModal(false);
      setSelectedEntries(new Set());
      setFormData({
        client_id: '',
        issue_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: '',
      });
      await loadInvoices();
      Alert.alert('Success', 'Invoice created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create invoice');
    }
  };

  const toggleEntrySelection = (entryId: string) => {
    const newSelection = new Set(selectedEntries);
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId);
    } else {
      newSelection.add(entryId);
    }
    setSelectedEntries(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await databaseService.updateInvoice(invoice.id, {
        status: 'paid',
      });
      await loadInvoices();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update invoice');
    }
  };

  const handleShare = async (invoice: Invoice) => {
    try {
      await Share.share({
        message: `Invoice #${invoice.invoice_number}\nAmount: ${formatCurrency(invoice.total)}\nDue: ${formatDate(invoice.due_date)}`,
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  const handleDelete = (invoice: Invoice) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteInvoice(invoice.id);
              await loadInvoices();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete invoice');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const selectedTotal = availableEntries
    .filter((e) => selectedEntries.has(e.id))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Button title="+ New" onPress={handleOpenInvoiceForm} style={styles.addButton} />
      </View>

      {invoices.length === 0 ? (
        <EmptyState
          title="No Invoices"
          message="Create your first invoice from time entries"
          actionLabel="Create Invoice"
          onAction={handleOpenInvoiceForm}
        />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            return (
              <Card style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>#{item.invoice_number}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(item.status)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(item.status) }]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.amount}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue Date</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(item.issue_date)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Due</Text>
                    <Text style={styles.detailValue}>{formatDate(item.due_date)}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  {item.status !== 'paid' && (
                    <Button
                      title="Mark Paid"
                      onPress={() => handleMarkPaid(item)}
                      variant="secondary"
                      style={styles.actionButton}
                    />
                  )}
                  <Button
                    title="Share"
                    onPress={() => handleShare(item)}
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

      {/* Summary */}
      {invoices.length > 0 && (
        <View style={styles.summary}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(
                  invoices.reduce((sum, inv) => sum + inv.total, 0)
                )}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Paid</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency(
                  invoices
                    .filter((inv) => inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.total, 0)
                )}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                {formatCurrency(
                  invoices
                    .filter((inv) => inv.status !== 'paid')
                    .reduce((sum, inv) => sum + inv.total, 0)
                )}
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* Create Invoice Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Entries</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.entriesScroll}>
              {availableEntries.length === 0 ? (
                <View style={styles.emptyEntries}>
                  <Text style={styles.emptyText}>
                    No unbilled time entries for this client
                  </Text>
                </View>
              ) : (
                availableEntries.map((entry) => {
                  const client = clients.find((c) => c.id === entry.client_id);
                  const duration =
                    Math.floor(entry.duration_minutes / 60) +
                    'h ' +
                    (entry.duration_minutes % 60) +
                    'm';
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={[
                        styles.entryItem,
                        selectedEntries.has(entry.id) && styles.entryItemSelected,
                      ]}
                      onPress={() => toggleEntrySelection(entry.id)}
                    >
                      <View style={styles.entryCheckbox}>
                        <Text style={styles.checkbox}>
                          {selectedEntries.has(entry.id) ? '✓' : '○'}
                        </Text>
                      </View>
                      <View style={styles.entryDetails}>
                        <Text style={styles.entryClient}>{client?.name}</Text>
                        <Text style={styles.entryDuration}>{duration}</Text>
                        {entry.notes && (
                          <Text style={styles.entryNotes} numberOfLines={1}>
                            {entry.notes}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.entryAmount}>
                        {formatCurrency(entry.amount)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Selected:</Text>
                <Text style={styles.totalValue}>{formatCurrency(selectedTotal)}</Text>
              </View>
              <Button
                title={`Create Invoice (${selectedEntries.size} entries)`}
                onPress={handleSaveInvoice}
                disabled={selectedEntries.size === 0}
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
  list: {
    padding: 16,
    paddingBottom: 160,
  },
  invoiceCard: {
    padding: 16,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  invoiceDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
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
  summary: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  summaryCard: {
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
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
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  entriesScroll: {
    maxHeight: 400,
  },
  emptyEntries: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  entryItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  entryCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkbox: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  entryDetails: {
    flex: 1,
    marginRight: 12,
  },
  entryClient: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  entryDuration: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  entryNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
