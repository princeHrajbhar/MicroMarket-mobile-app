import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const data = await productService.getFavorites();
      setFavorites(data.map(p => ({ ...p, isFavorited: true })));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  const handleRemove = (id: string) => {
    setFavorites(prev => prev.filter(p => p._id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="My Wishlist" subtitle={favorites.length > 0 ? `${favorites.length} saved items` : undefined} />
      {loading ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 16, flexGrow: 1 }}
          renderItem={({ item, index }) => (
            <ProductCard
              product={item}
              index={index}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              onFavoriteToggle={(id, isFav) => { if (!isFav) handleRemove(id); }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Your Wishlist is Empty"
              subtitle="Save products you love by tapping the heart icon on any product."
              actionLabel="Start Shopping"
              onAction={() => navigation.navigate('Home')}
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFavorites(); }} colors={[colors.primary]} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 16 },
  row: { justifyContent: 'space-between' },
});
