import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import {
  Product,
  AdminStackParamList,
} from '../types';
import Input from '../components/Input';
import AnimatedButton from '../components/AnimatedButton';

type NavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'EditProduct'
>;

type RouteProps = RouteProp<
  AdminStackParamList,
  'EditProduct'
>;

export default function EditProductScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();

  const product: Product = route.params.product;

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [image, setImage] = useState(product.image);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // UPDATE PRODUCT
  // ─────────────────────────────────────────────
 const handleUpdate = async () => {
  if (!title || !description || !price || !image) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  setLoading(true);

  try {
    await productService.updateProduct(product._id, {
      title,
      description,
      price: Number(price),
      image,
    });

    Alert.alert('Success', 'Product updated successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to update product';

    Alert.alert('Error', message);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#1A1A2E', '#16213E']}
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
        >
          <Text style={styles.headerTitle}>
            Edit Product ✏️
          </Text>
          <Text style={styles.headerSub}>
            Update product information
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
        >
          <Input
            label="Product Title *"
            placeholder="Enter product name"
            value={title}
            onChangeText={setTitle}
            icon="cube-outline"
            autoCapitalize="sentences"
          />

          <Input
            label="Description *"
            placeholder="Describe your product..."
            value={description}
            onChangeText={setDescription}
            icon="document-text-outline"
            autoCapitalize="sentences"
            multiline
            numberOfLines={4}
          />

          <Input
            label="Price (USD) *"
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            icon="pricetag-outline"
          />

          <Input
            label="Image URL *"
            placeholder="https://..."
            value={image}
            onChangeText={setImage}
            icon="image-outline"
          />

          <AnimatedButton
            title="Save Changes"
            onPress={handleUpdate}
            loading={loading}
            style={{ marginTop: 24 }}
            icon={
              <Ionicons
                name="save"
                size={18}
                color="#fff"
              />
            }
          />

          <AnimatedButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    marginBottom: 16,
    padding: 4,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    padding: 24,
  },
});