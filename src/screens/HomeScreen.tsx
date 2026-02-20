import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import OfflineBanner from '../components/OfflineBanner';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'];

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const searchTimer = useRef<any>(null);

const fetchProducts = useCallback(
  async (p = 1, q = '', reset = false) => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      const items = await productService.getProducts(p, q);

      if (reset || p === 1) {
        setProducts(items);
      } else {
        setProducts(prev => [...prev, ...items]);
      }

      // Since backend does not return total pages,
      // we assume if items length < limit → no more data
      setHasMore(items.length === 10);
      setPage(p);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  },
  [isConnected]
);

  useEffect(() => {
    fetchProducts(1, search, true);
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      fetchProducts(1, text, true);
    }, 500);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, search, true);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchProducts(page + 1, search);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHeader = () => (
    <View>
      {/* Hero Banner */}
      <LinearGradient colors={['#FF6B35', '#E55A26']} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.heroSub}>What are you shopping for?</Text>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.heroBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar value={search} onChangeText={handleSearch} onClear={() => handleSearch('')} />
        </View>
      </LinearGradient>

      {/* Featured Banner */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={[styles.featuredBanner, { backgroundColor: colors.card }]}>
          <View>
            <Text style={[styles.featuredTag, { color: colors.primary }]}>🔥 Hot Deal</Text>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>Up to 50% off</Text>
            <Text style={[styles.featuredSub, { color: colors.textSecondary }]}>On selected items</Text>
          </View>
          <View style={[styles.featuredCircle, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="flash" size={32} color={colors.primary} />
          </View>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCat(item)}
              style={[
                styles.catChip,
                {
                  backgroundColor: selectedCat === item ? colors.primary : colors.surfaceVariant,
                  borderColor: selectedCat === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.catText, { color: selectedCat === item ? '#fff' : colors.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 16 }}
        />
      </Animated.View>

      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 0 }]}>
          {search ? `Results for "${search}"` : 'All Products'}
        </Text>
        <Text style={[styles.countText, { color: colors.textMuted }]}>{products.length} items</Text>
      </View>
    </View>
  );

  const renderSkeletons = () => (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OfflineBanner />
      {loading ? (
        <>
          {renderHeader()}
          {renderSkeletons()}
        </>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <ProductCard
              product={item}
              index={index}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="search"
                title="No Products Found"
                subtitle={search ? `No results for "${search}". Try a different keyword.` : "No products available right now."}
                actionLabel={search ? "Clear Search" : undefined}
                onAction={() => handleSearch('')}
              />
            ) : null
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 0 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', position: 'absolute', top: 6, right: 6, borderWidth: 1, borderColor: '#FF6B35' },
  searchWrapper: { marginBottom: -24, zIndex: 10 },
  featuredBanner: {
    marginHorizontal: 16,
    marginTop: 36,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredTag: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  featuredTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  featuredSub: { fontSize: 13 },
  featuredCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginHorizontal: 16, marginBottom: 12 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13, fontWeight: '600' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 4 },
  countText: { fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 16 },
  row: { justifyContent: 'space-between', marginBottom: 0 },
});
