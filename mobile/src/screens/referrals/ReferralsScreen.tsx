import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'expired';
  createdAt: string;
  reward: number;
}

export const ReferralsScreen = () => {
  const { user } = useAuthStore();
  const [referrals] = useState<Referral[]>([
    // Demo data
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: '2024-01-15',
      reward: 10,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'pending',
      createdAt: '2024-02-20',
      reward: 0,
    },
  ]);

  // Generate referral code from user email
  const referralCode = user?.email
    ? Buffer.from(user.email).toString('base64').substring(0, 8).toUpperCase()
    : 'DEMO1234';
  const referralLink = `https://tradetimer.app/ref/${referralCode}`;

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter((r) => r.status === 'active').length;
  const totalRewards = referrals.reduce((sum, r) => sum + r.reward, 0);

  const handleCopyLink = async () => {
    await Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Try TradeTimer - the best time tracking app for contractors! Sign up with my referral code ${referralCode} and we both get rewards. ${referralLink}`,
        title: 'Join TradeTimer',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShareEmail = () => {
    Alert.alert('Email Share', 'Email sharing coming soon!');
  };

  const handleShareSMS = () => {
    Alert.alert('SMS Share', 'SMS sharing coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'expired':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Referral Program Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Earn Rewards!</Text>
          <Text style={styles.infoText}>
            Refer friends and colleagues to TradeTimer. For every referral who upgrades to Pro,
            you'll get <Text style={styles.highlight}>$10 credit</Text> and they get{' '}
            <Text style={styles.highlight}>1 month free</Text>!
          </Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{activeReferrals}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              ${totalRewards}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </Card>
        </View>

        {/* Referral Link */}
        <Card style={styles.linkCard}>
          <Text style={styles.sectionTitle}>Your Referral Link</Text>
          <View style={styles.linkContainer}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            <Button title="Copy" onPress={handleCopyLink} style={styles.copyButton} />
          </View>

          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Referral Code</Text>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
        </Card>

        {/* Share Options */}
        <Card style={styles.shareCard}>
          <Text style={styles.sectionTitle}>Share Via</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
              <Text style={styles.shareIcon}>📱</Text>
              <Text style={styles.shareLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption} onPress={handleShareEmail}>
              <Text style={styles.shareIcon}>✉️</Text>
              <Text style={styles.shareLabel}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption} onPress={handleShareSMS}>
              <Text style={styles.shareIcon}>💬</Text>
              <Text style={styles.shareLabel}>SMS</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Referrals List */}
        {referrals.length > 0 && (
          <Card style={styles.listCard}>
            <Text style={styles.sectionTitle}>Your Referrals</Text>
            {referrals.map((referral, index) => (
              <View key={referral.id}>
                <View style={styles.referralItem}>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{referral.name}</Text>
                    <Text style={styles.referralEmail}>{referral.email}</Text>
                    <Text style={styles.referralDate}>
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.referralRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(referral.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(referral.status) },
                        ]}
                      >
                        {getStatusLabel(referral.status).toUpperCase()}
                      </Text>
                    </View>
                    {referral.reward > 0 && (
                      <Text style={styles.rewardText}>+${referral.reward}</Text>
                    )}
                  </View>
                </View>
                {index < referrals.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        )}

        {/* How It Works */}
        <Card style={styles.howItWorksCard}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share your link</Text>
                <Text style={styles.stepDescription}>
                  Send your unique referral link to friends and colleagues
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>They sign up</Text>
                <Text style={styles.stepDescription}>
                  Your referral creates an account and gets 1 month free Pro
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>You both win</Text>
                <Text style={styles.stepDescription}>
                  When they upgrade to Pro, you get $10 credit
                </Text>
              </View>
            </View>
          </View>
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
  infoCard: {
    margin: 16,
    padding: 20,
    backgroundColor: `${theme.colors.primary}10`,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  linkCard: {
    margin: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  linkBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  copyButton: {
    paddingHorizontal: 20,
  },
  codeContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  shareCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareOption: {
    alignItems: 'center',
    padding: 16,
  },
  shareIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  listCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  referralEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  referralRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  howItWorksCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  stepsList: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
