import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const { colors } = useTheme();
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (!isConnected) {
      translateY.value = withSpring(0, { damping: 14 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withSpring(-60, { damping: 14 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [isConnected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <Ionicons name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.text}>You're offline. Check your connection.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
