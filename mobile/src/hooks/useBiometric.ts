import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@/utils/storage';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(compatible);
    setIsEnrolled(enrolled);
  };

  const loadBiometricPreference = async () => {
    const enabled = await storage.getBiometricEnabled();
    setIsEnabled(enabled);
  };

  const authenticate = async (): Promise<boolean> => {
    if (!isAvailable || !isEnrolled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access TradeTimer',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    if (!isAvailable || !isEnrolled) {
      return false;
    }

    const success = await authenticate();
    if (success) {
      await storage.setBiometricEnabled(true);
      setIsEnabled(true);
      return true;
    }
    return false;
  };

  const disableBiometric = async () => {
    await storage.setBiometricEnabled(false);
    setIsEnabled(false);
  };

  return {
    isAvailable,
    isEnrolled,
    isEnabled,
    authenticate,
    enableBiometric,
    disableBiometric,
  };
};
