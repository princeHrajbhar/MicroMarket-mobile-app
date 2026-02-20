import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreenComponent() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 600 });
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 500 });
    }, 400);
    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 500 });
    }, 700);
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 200);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <LinearGradient colors={['#FF6B35', '#E55A26', '#C94A1E']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.iconBg, logoStyle]}>
        <Ionicons name="storefront" size={56} color="#fff" />
      </Animated.View>
      <Animated.Text style={[styles.brand, textStyle]}>MicroMarket</Animated.Text>
      <Animated.Text style={[styles.tagline, tagStyle]}>Discover · Shop · Enjoy</Animated.Text>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBg: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    gap: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 20, backgroundColor: '#fff' },
});
