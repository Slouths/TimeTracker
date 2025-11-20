import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';
import { databaseService } from '@/services/supabase/database';

interface UsageStats {
  entriesCount: number;
  clientsCount: number;
  projectsCount: number;
  invoicesCount: number;
}

const PLAN_LIMITS = {
  free: {
    entries: 100,
    clients: 5,
    projects: 10,
    invoices: 10,
  },
  pro: {
    entries: Infinity,
    clients: Infinity,
    projects: Infinity,
    invoices: Infinity,
  },
};

export const SubscriptionScreen = () => {
  const { user } = useAuthStore();
  const [usage, setUsage] = useState<UsageStats>({
    entriesCount: 0,
    clientsCount: 0,
    projectsCount: 0,
    invoicesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // For demo purposes, assume user is on free plan
  const [currentPlan] = useState<'free' | 'pro'>('free');
  const isPro = currentPlan === 'pro';

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    if (!user) return;

    try {
      const [entriesRes, clientsRes, projectsRes, invoicesRes] = await Promise.all([
        databaseService.getTimeEntries(user.id),
        databaseService.getClients(user.id),
        databaseService.getProjects(user.id),
        databaseService.getInvoices(user.id),
      ]);

      setUsage({
        entriesCount: entriesRes.data?.length || 0,
        clientsCount: clientsRes.data?.length || 0,
        projectsCount: projectsRes.data?.length || 0,
        invoicesCount: invoicesRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'Upgrading to Pro will unlock unlimited entries, clients, projects, and invoices, plus advanced features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // This would open the in-app purchase flow
            Alert.alert('Coming Soon', 'In-app purchases will be available soon!');
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, go to Settings > Apple ID > Subscriptions on your device.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, open the Google Play Store app and go to Subscriptions.',
        [{ text: 'OK' }]
      );
    }
  };

  const getProgressPercentage = (current: number, limit: number) => {
    if (limit === Infinity) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const limits = PLAN_LIMITS[currentPlan];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Current Plan */}
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </Text>
            <View
              style={[
                styles.planBadge,
                { backgroundColor: isPro ? theme.colors.success : theme.colors.warning },
              ]}
            >
              <Text style={styles.planBadgeText}>
                {isPro ? 'ACTIVE' : 'FREE'}
              </Text>
            </View>
          </View>

          {isPro ? (
            <View style={styles.planDetails}>
              <Text style={styles.planPrice}>$9.99/month</Text>
              <Text style={styles.planDescription}>
                Unlimited everything + advanced features
              </Text>
            </View>
          ) : (
            <View style={styles.planDetails}>
              <Text style={styles.planPrice}>$0/month</Text>
              <Text style={styles.planDescription}>
                Perfect for getting started with time tracking
              </Text>
            </View>
          )}
        </Card>

        {/* Usage Stats */}
        {!isPro && (
          <Card style={styles.usageCard}>
            <Text style={styles.sectionTitle}>Usage</Text>

            {/* Entries */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Time Entries</Text>
                <Text style={styles.usageValue}>
                  {usage.entriesCount} / {limits.entries}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(usage.entriesCount, limits.entries)}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage(usage.entriesCount, limits.entries)
                      ),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Clients */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Clients</Text>
                <Text style={styles.usageValue}>
                  {usage.clientsCount} / {limits.clients}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(usage.clientsCount, limits.clients)}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage(usage.clientsCount, limits.clients)
                      ),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Projects */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Projects</Text>
                <Text style={styles.usageValue}>
                  {usage.projectsCount} / {limits.projects}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(usage.projectsCount, limits.projects)}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage(usage.projectsCount, limits.projects)
                      ),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Invoices */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>Invoices</Text>
                <Text style={styles.usageValue}>
                  {usage.invoicesCount} / {limits.invoices}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(usage.invoicesCount, limits.invoices)}%`,
                      backgroundColor: getProgressColor(
                        getProgressPercentage(usage.invoicesCount, limits.invoices)
                      ),
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Plan Features */}
        <Card style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>
            {isPro ? 'Pro Features' : 'Upgrade to Pro'}
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Unlimited time entries</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Unlimited clients & projects</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Unlimited invoices</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Advanced reporting & analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>PDF invoice generation</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Priority support</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Export data to CSV</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Team collaboration (coming soon)</Text>
            </View>
          </View>

          {!isPro && (
            <Button
              title="Upgrade to Pro - $9.99/month"
              onPress={handleUpgrade}
              style={styles.upgradeButton}
            />
          )}
        </Card>

        {/* Manage Subscription */}
        {isPro && (
          <Card style={styles.manageCard}>
            <Text style={styles.sectionTitle}>Manage Subscription</Text>
            <Text style={styles.manageDescription}>
              Your subscription renews automatically. You can cancel anytime from your device
              settings.
            </Text>
            <Button
              title="Manage Subscription"
              onPress={handleManageSubscription}
              variant="secondary"
              style={styles.manageButton}
            />
          </Card>
        )}

        {/* Free Plan Info */}
        {!isPro && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Why Upgrade?</Text>
            <Text style={styles.infoText}>
              The free plan is perfect for individuals just getting started. As your business
              grows, upgrade to Pro for unlimited everything and advanced features.
            </Text>
          </Card>
        )}
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
  planCard: {
    margin: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planDetails: {
    marginTop: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  usageCard: {
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
  usageItem: {
    marginBottom: 20,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  featuresCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 18,
    color: theme.colors.success,
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  upgradeButton: {
    marginTop: 8,
  },
  manageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  manageDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  manageButton: {
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    backgroundColor: `${theme.colors.primary}10`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
