import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store';
import type { MoreScreenProps } from '@/types/navigation';

export const MoreScreen = ({ navigation }: MoreScreenProps<'More'>) => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        {
          title: 'Profile',
          icon: '👤',
          onPress: () => navigation.navigate('Profile'),
          badge: null,
        },
        {
          title: 'Preferences',
          icon: '⚙️',
          onPress: () => navigation.navigate('Preferences'),
          badge: null,
        },
      ],
    },
    {
      section: 'Business',
      items: [
        {
          title: 'Clients',
          icon: '👥',
          onPress: () => Alert.alert('Clients', 'Go to the Clients screen from Projects tab'),
          badge: null,
        },
        {
          title: 'Invoices',
          icon: '📄',
          onPress: () => navigation.navigate('Invoices'),
          badge: null,
        },
      ],
    },
    {
      section: 'Subscription',
      items: [
        {
          title: 'Subscription',
          icon: '💳',
          onPress: () => navigation.navigate('Subscription'),
          badge: 'Free',
        },
        {
          title: 'Referrals',
          icon: '🎁',
          onPress: () => navigation.navigate('Referrals'),
          badge: null,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          title: 'Help & Support',
          icon: '❓',
          onPress: () => Alert.alert('Help', 'Coming soon!'),
          badge: null,
        },
        {
          title: 'About',
          icon: 'ℹ️',
          onPress: () =>
            Alert.alert(
              'TradeTimer',
              'Version 1.0.0\n\nTime tracking made simple for contractors and freelancers.'
            ),
          badge: null,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                      <Text style={styles.menuItemText}>{item.title}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Text style={styles.menuChevron}>›</Text>
                    </View>
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>TradeTimer v1.0.0</Text>
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
  userCard: {
    margin: 16,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuCard: {
    marginHorizontal: 16,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  menuChevron: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 54,
  },
  signOutButton: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  version: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
});
