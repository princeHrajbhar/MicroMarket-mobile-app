import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';
import { productService } from '../services/productService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  index?: number;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
}

export default function ProductCard({
  product,
  onPress,
  index = 0,
  onFavoriteToggle,
}: ProductCardProps) {
  const { colors } = useTheme();
  const [isFav, setIsFav] = useState(false);

  const scale = useSharedValue(1);
  const elevation = useSharedValue(4);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: withTiming(elevation.value === 4 ? 0.08 : 0.15, {
      duration: 200,
    }),
    elevation: elevation.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    elevation.value = withTiming(2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    elevation.value = withTiming(4);
  };

  const handleToggleFav = async () => {
    const next = !isFav;
    setIsFav(next);

    try {
      if (next) {
        await productService.addFavorite(product._id);
      } else {
        await productService.removeFavorite(product._id);
      }

      onFavoriteToggle?.(product._id, next);
    } catch {
      setIsFav(!next);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: '#000',
          width: CARD_WIDTH,
        },
        cardStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                product.image ||
                'https://via.placeholder.com/300x300.png?text=No+Image',
            }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.favBtn}>
            <FavoriteButton
              isFavorited={isFav}
              onToggle={handleToggleFav}
              size={18}
            />
          </View>
        </View>

        <View style={styles.info}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {product.title}
          </Text>

          <Text style={[styles.price, { color: colors.primary }]}>
            ${product.price.toFixed(2)}
          </Text>

          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date(product.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  date: {
    fontSize: 11,
    marginTop: 4,
  },
});