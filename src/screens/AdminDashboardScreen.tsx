import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { Product, AdminStackParamList } from '../types';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'AdminDashboard'
>;

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─────────────────────────────────────────────
  // LOAD PRODUCTS
  // ─────────────────────────────────────────────
const loadProducts = async () => {
  try {
    const response = await productService.getProducts(1, '', 100);

    // response is Product[]
    setProducts(response ?? []);
  } catch (error: unknown) {
    console.error('Error loading products:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load products';

    Alert.alert('Error', message);

    setProducts([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  // ─────────────────────────────────────────────
  // DELETE PRODUCT
  // ─────────────────────────────────────────────
  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Delete "${product.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(product._id);

              setProducts((prev) =>
                prev.filter((p) => p._id !== product._id)
              );

              Alert.alert(
                'Success',
                'Product deleted successfully'
              );
            } catch (err: unknown) {
              console.error('Delete error:', err);

              const message =
                err instanceof Error
                  ? err.message
                  : 'Failed to delete product';

              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────
  // STATS (Minimal)
  // ─────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: 'cube',
      color: colors.primary,
    },
  ];

  const handleEdit = (product: Product) => {
    navigation.navigate('EditProduct', { product });
  };

  const handleAddProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  // ─────────────────────────────────────────────
  // RENDER PRODUCT
  // ─────────────────────────────────────────────
  const renderProductItem = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 60)}
      style={[
        styles.productRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImg}
      />

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text
          style={[
            styles.productTitle,
            { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text
          style={[
            styles.productPrice,
            { color: colors.primary },
          ]}
        >
          ${item.price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Ionicons
            name="pencil"
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.error + '20' },
          ]}
        >
          <Ionicons
            name="trash"
            size={16}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <LinearGradient
        colors={['#1A1A2E', '#16213E']}
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>
              Admin Dashboard 🛠
            </Text>
            <Text style={styles.headerSub}>
              Welcome, {user?.name || 'Admin'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <Ionicons
                name={s.icon as any}
                size={20}
                color={s.color}
              />
              <Text style={styles.statValue}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.actionBar}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          All Products
        </Text>

        <TouchableOpacity
          onPress={handleAddProduct}
          style={[
            styles.addBtn,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons
            name="add"
            size={18}
            color="#fff"
          />
          <Text style={styles.addBtnText}>
            Add Product
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map((i) => (
            <ProductCardSkeleton
              key={`skeleton-${i}`}
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadProducts();
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No Products Yet"
              subtitle="Create your first product to get started."
              actionLabel="Create Product"
              onAction={handleAddProduct}
            />
          }
          renderItem={renderProductItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  productImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  actions: {
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});