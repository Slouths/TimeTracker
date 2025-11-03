import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: '@tradetimer:biometric_enabled',
  LAST_SYNC: '@tradetimer:last_sync',
  OFFLINE_QUEUE: '@tradetimer:offline_queue',
  CACHED_DATA: '@tradetimer:cached_data',
  USER_PREFERENCES: '@tradetimer:user_preferences',
};

export const storage = {
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Specific helpers
  async getBiometricEnabled(): Promise<boolean> {
    const value = await this.get<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return value ?? false;
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.set(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  },

  async getOfflineQueue<T>(): Promise<T[]> {
    const value = await this.get<T[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    return value ?? [];
  },

  async setOfflineQueue<T>(queue: T[]): Promise<void> {
    await this.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  },

  async addToOfflineQueue<T>(item: T): Promise<void> {
    const queue = await this.getOfflineQueue<T>();
    queue.push(item);
    await this.setOfflineQueue(queue);
  },

  async clearOfflineQueue(): Promise<void> {
    await this.remove(STORAGE_KEYS.OFFLINE_QUEUE);
  },
};
