import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.colors.primary };
      case 'secondary':
        return { backgroundColor: theme.colors.textSecondary };
      case 'danger':
        return { backgroundColor: theme.colors.error };
      case 'success':
        return { backgroundColor: theme.colors.success };
      case 'warning':
        return { backgroundColor: theme.colors.warning };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  };

  const getSizeStyle = (): ViewStyle & TextStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: theme.fontSize.sm };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: theme.fontSize.md };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32, fontSize: theme.fontSize.lg };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: theme.fontSize.md };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, { fontSize: getSizeStyle().fontSize }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
