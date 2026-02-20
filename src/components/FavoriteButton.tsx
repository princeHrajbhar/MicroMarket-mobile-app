import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  size?: number;
}

export default function FavoriteButton({ isFavorited, onToggle, size = 24 }: FavoriteButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isFavorited) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      rotate.value = withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [isFavorited]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <TouchableOpacity onPress={onToggle} style={styles.btn} activeOpacity={0.8}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorited ? colors.favorite : colors.unfavorite}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 6 },
});
