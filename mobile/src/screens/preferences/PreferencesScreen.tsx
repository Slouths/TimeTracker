import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';
import { useSettingsStore, useAuthStore } from '@/store';

const TIMEZONES = [
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'UTC', value: 'UTC' },
];

const DATE_FORMATS = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
];

const TIME_FORMATS = [
  { label: '12 Hour (AM/PM)', value: '12h' },
  { label: '24 Hour', value: '24h' },
];

const CURRENCIES = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'CAD ($)', value: 'CAD' },
  { label: 'AUD ($)', value: 'AUD' },
];

const ROUNDING_OPTIONS = [
  { label: 'No Rounding', value: 0 },
  { label: 'Round to 15 min', value: 15 },
  { label: 'Round to 30 min', value: 30 },
  { label: 'Round to 1 hour', value: 60 },
];

const IDLE_TIMEOUT_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
];

export const PreferencesScreen = () => {
  const { user } = useAuthStore();
  const { userSettings, timerPreferences, updateUserSettings, updateTimerPreferences } = useSettingsStore();
  const [isSaving, setIsSaving] = useState(false);

  // Local state for settings
  const [timezone, setTimezone] = useState(userSettings?.timezone || 'America/New_York');
  const [dateFormat, setDateFormat] = useState(userSettings?.date_format || 'MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(userSettings?.time_format || '12h');
  const [currency, setCurrency] = useState(userSettings?.currency || 'USD');
  const [autoStartTimer, setAutoStartTimer] = useState(timerPreferences?.auto_start_timer ?? true);
  const [roundingMinutes, setRoundingMinutes] = useState(timerPreferences?.rounding_minutes || 0);
  const [idleTimeout, setIdleTimeout] = useState(timerPreferences?.idle_timeout_minutes || 0);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateUserSettings(user.id, {
          timezone,
          date_format: dateFormat,
          time_format: timeFormat as '12h' | '24h',
          currency,
        }),
        updateTimerPreferences(user.id, {
          auto_start_timer: autoStartTimer,
          rounding_enabled: roundingMinutes > 0,
          rounding_minutes: roundingMinutes,
          idle_detection_enabled: idleTimeout > 0,
          idle_timeout_minutes: idleTimeout,
        }),
      ]);
      Alert.alert('Success', 'Preferences saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setTimezone('America/New_York');
            setDateFormat('MM/DD/YYYY');
            setTimeFormat('12h');
            setCurrency('USD');
            setAutoStartTimer(true);
            setRoundingMinutes(0);
            setIdleTimeout(0);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Regional Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Regional Settings</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Timezone</Text>
            <View style={styles.optionsList}>
              {TIMEZONES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    timezone === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setTimezone(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      timezone === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {timezone === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date Format</Text>
            <View style={styles.optionsList}>
              {DATE_FORMATS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    dateFormat === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setDateFormat(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      dateFormat === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {dateFormat === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Time Format</Text>
            <View style={styles.optionsList}>
              {TIME_FORMATS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    timeFormat === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setTimeFormat(option.value as '12h' | '24h')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      timeFormat === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {timeFormat === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.optionsList}>
              {CURRENCIES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    currency === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setCurrency(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currency === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {currency === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Timer Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Timer Settings</Text>

          <View style={styles.switchField}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Auto-start Timer</Text>
              <Text style={styles.helpText}>
                Automatically start timer when creating new entry
              </Text>
            </View>
            <Switch
              value={autoStartTimer}
              onValueChange={setAutoStartTimer}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Time Rounding</Text>
            <Text style={styles.helpText}>
              Round time entries to nearest interval
            </Text>
            <View style={styles.optionsList}>
              {ROUNDING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    roundingMinutes === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setRoundingMinutes(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      roundingMinutes === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {roundingMinutes === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Idle Timeout</Text>
            <Text style={styles.helpText}>
              Pause timer after period of inactivity
            </Text>
            <View style={styles.optionsList}>
              {IDLE_TIMEOUT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    idleTimeout === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => setIdleTimeout(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      idleTimeout === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {idleTimeout === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isSaving ? 'Saving...' : 'Save Preferences'}
            onPress={handleSave}
            disabled={isSaving}
          />
          <Button
            title="Reset to Defaults"
            onPress={handleReset}
            variant="secondary"
            style={styles.resetButton}
          />
        </View>
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
  section: {
    margin: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  field: {
    marginBottom: 24,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionItemSelected: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  resetButton: {
    marginTop: 12,
  },
});
