import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    primary: '#FF6B35',
    primaryDark: '#E55A26',
    primaryLight: '#FF8C5A',
    secondary: '#2D3436',
    accent: '#00B894',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F2F5',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    card: '#FFFFFF',
    cardShadow: 'rgba(0,0,0,0.08)',
    skeleton: '#E5E7EB',
    skeletonHighlight: '#F3F4F6',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
    favorite: '#EF4444',
    unfavorite: '#D1D5DB',
  },
  dark: {
    primary: '#FF6B35',
    primaryDark: '#E55A26',
    primaryLight: '#FF8C5A',
    secondary: '#F3F4F6',
    accent: '#00B894',
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceVariant: '#252538',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#6B7280',
    border: '#2D2D44',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    card: '#1E1E32',
    cardShadow: 'rgba(0,0,0,0.4)',
    skeleton: '#252538',
    skeletonHighlight: '#2D2D44',
    tabBar: '#1A1A2E',
    header: '#1A1A2E',
    overlay: 'rgba(0,0,0,0.7)',
    favorite: '#EF4444',
    unfavorite: '#4B5563',
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: Colors.light,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('@theme');
      if (saved !== null) {
        setIsDark(saved === 'dark');
      } else {
        setIsDark(systemTheme === 'dark');
      }
    } catch {}
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('@theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? Colors.dark : Colors.light }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
