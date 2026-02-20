import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions, Share,
} from 'react-native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import FavoriteButton from '../components/FavoriteButton';
import AnimatedButton from '../components/AnimatedButton';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
      setIsFav(data.isFavorited ?? false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFav = async () => {
    if (!product) return;
    const next = !isFav;
    setIsFav(next);
    try {
      if (next) await productService.addFavorite(product._id);
      else await productService.removeFavorite(product._id);
    } catch {
      setIsFav(!next);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    await Share.share({ message: `Check out ${product.title} for $${product.price} on MicroMarket!` });
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const stars = Math.round(product.rating || 4.5);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Top actions */}
          <View style={[styles.topActions, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.actionBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Ionicons name="share-social" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <FavoriteButton isFavorited={isFav} onToggle={handleToggleFav} size={20} />
              </View>
            </View>
          </View>
          {/* Stock badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <View style={[styles.stockBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.stockText}>Only {product.stock} left!</Text>
            </View>
          )}
        </Animated.View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
                {product.title}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>${product.price?.toFixed(2)}</Text>
              <View style={[styles.stockPill, { backgroundColor: product.stock > 0 ? colors.success + '20' : colors.error + '20' }]}>
                <Text style={[styles.stockPillText, { color: product.stock > 0 ? colors.success : colors.error }]}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
              ))}
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {product.rating?.toFixed(1) || '4.5'} ({product.numReviews || 0} reviews)
              </Text>
            </View>

            {/* Category */}
            <View style={[styles.catPill, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.catText, { color: colors.textSecondary }]}>{product.category}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{product.description}</Text>
          </Animated.View>

          {/* Seller */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.sellerCard, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: colors.primary + '30' }]}>
                <Ionicons name="storefront" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sellerLabel, { color: colors.textMuted }]}>Sold by</Text>
                <Text style={[styles.sellerName, { color: colors.text }]}>{product.seller || 'Official Store'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={[styles.bottomBar, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}
      >
        <View style={styles.bottomContent}>
          <View>
            <Text style={[styles.bottomLabel, { color: colors.textMuted }]}>Total Price</Text>
            <Text style={[styles.bottomPrice, { color: colors.primary }]}>${product.price?.toFixed(2)}</Text>
          </View>
          <AnimatedButton
            title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            onPress={() => Alert.alert('Added!', `${product.title} added to cart.`)}
            disabled={product.stock === 0}
            style={styles.cartBtn}
            icon={<Ionicons name="cart" size={18} color="#fff" />}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width, height: 380, position: 'relative' },
  image: { width: '100%', height: '100%' },
  topActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  actionBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  rightActions: { flexDirection: 'row', gap: 10 },
  stockBadge: { position: 'absolute', bottom: 16, left: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  stockText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 24 },
  titleRow: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: '900' },
  stockPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  stockPillText: { fontSize: 12, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  ratingText: { fontSize: 13, marginLeft: 6 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  catText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 24 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sellerLabel: { fontSize: 11, fontWeight: '500' },
  sellerName: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 16 },
  bottomContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLabel: { fontSize: 12 },
  bottomPrice: { fontSize: 22, fontWeight: '800' },
  cartBtn: { flex: 1, marginLeft: 20 },
});
