import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonBox({ width: w = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.6, 1]),
    backgroundColor: interpolate(shimmer.value, [0, 1], [
      parseInt(colors.skeleton.replace('#', ''), 16) / 0xFFFFFF,
      parseInt(colors.skeletonHighlight.replace('#', ''), 16) / 0xFFFFFF,
    ]) === 0 ? colors.skeleton : colors.skeletonHighlight,
  }));

  return (
    <Animated.View
      style={[{ width: w as any, height, borderRadius, backgroundColor: colors.skeleton }, style, animStyle]}
    />
  );
}

export function ProductCardSkeleton() {
  const { colors } = useTheme();
  const CARD = (width - 48) / 2;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, width: CARD }]}>
      <SkeletonBox height={CARD} borderRadius={0} />
      <View style={styles.info}>
        <SkeletonBox height={14} width="80%" borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox height={12} width="50%" borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox height={18} width="40%" borderRadius={6} />
      </View>
    </View>
  );
}

export function ProductDetailSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SkeletonBox height={360} borderRadius={0} />
      <View style={{ padding: 20 }}>
        <SkeletonBox height={24} width="80%" borderRadius={8} style={{ marginBottom: 12 }} />
        <SkeletonBox height={16} width="40%" borderRadius={6} style={{ marginBottom: 16 }} />
        <SkeletonBox height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox height={14} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox height={14} width="70%" borderRadius={6} style={{ marginBottom: 24 }} />
        <SkeletonBox height={54} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  info: { padding: 12 },
});
