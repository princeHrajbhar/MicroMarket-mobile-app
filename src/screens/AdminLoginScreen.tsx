import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import AnimatedButton from '../components/AnimatedButton';

export default function AdminLoginScreen() {
  const { colors } = useTheme();
  const { adminLogin } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      await adminLogin(email, password);
    } catch (err: any) {
      Alert.alert('Admin Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1A1A2E', '#16213E']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={36} color="#FF6B35" />
          </View>
          <Text style={styles.headerTitle}>Admin Portal 🔐</Text>
          <Text style={styles.headerSub}>Restricted access — authorized personnel only</Text>
        </Animated.View>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Input label="Admin Email" placeholder="admin@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail-outline" />
          <Input label="Admin Password" placeholder="Enter admin password" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed-outline" />
          <AnimatedButton title="Access Admin Panel" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: colors.textSecondary }]}>← Back to User Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { marginBottom: 16, padding: 4, alignSelf: 'flex-start' },
  iconBg: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,107,53,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  form: { padding: 24 },
  footer: { alignItems: 'center', marginTop: 24 },
  link: { fontSize: 15, fontWeight: '600' },
});
