import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import AnimatedButton from '../components/AnimatedButton';
import OfflineBanner from '../components/OfflineBanner';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};

    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';

    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed';

      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OfflineBanner />

      {/* HEADER */}
      <LinearGradient
        colors={['#FF6B35', '#E55A26']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={styles.logoRow}>
            <Ionicons name="storefront" size={28} color="#fff" />
            <Text style={styles.brand}>MicroMarket</Text>
          </View>

          <Text style={styles.headerTitle}>Welcome back! 👋</Text>
          <Text style={styles.headerSub}>
            Sign in to continue shopping
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* FORM */}
      <ScrollView
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(200)}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgot}
          >
            <Text
              style={[
                styles.forgotText,
                { color: colors.primary },
              ]}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          <AnimatedButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={styles.dividerRow}
        >
          <View
            style={[styles.line, { backgroundColor: colors.border }]}
          />
          <Text
            style={[styles.orText, { color: colors.textMuted }]}
          >
            or continue with
          </Text>
          <View
            style={[styles.line, { backgroundColor: colors.border }]}
          />
        </Animated.View>

        {/* Google Button Placeholder */}
        <Animated.View
          entering={FadeInDown.delay(350)}
          style={styles.socialRow}
        >
          <TouchableOpacity
            style={[
              styles.socialBtn,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="logo-google"
              size={22}
              color="#EA4335"
            />
            <Text
              style={[
                styles.socialText,
                { color: colors.text },
              ]}
            >
              Google
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.footer}
        >
          <Text
            style={[
              styles.footerText,
              { color: colors.textSecondary },
            ]}
          >
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
          >
            <Text
              style={[
                styles.footerLink,
                { color: colors.primary },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Admin Login */}
        <Animated.View
          entering={FadeInDown.delay(450)}
          style={styles.adminRow}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminLogin')}
            style={[
              styles.adminBtn,
              { borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.adminText,
                { color: colors.textSecondary },
              ]}
            >
              Admin Login
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
}
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  form: {
    padding: 24,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btn: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 13,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  adminRow: {
    alignItems: 'center',
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  adminText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
