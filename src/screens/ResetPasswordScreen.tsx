import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import AnimatedButton from '../components/AnimatedButton';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { resetPassword } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      Alert.alert('Success', 'Password reset successfully!', [{ text: 'Login', onPress: () => navigation.navigate('Login') }]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={['#FF6B35', '#E55A26']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.headerTitle}>Reset Password 🔒</Text>
          <Text style={styles.headerSub}>Create a strong new password</Text>
        </Animated.View>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Input label="New Password" placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed-outline" />
          <Input label="Confirm Password" placeholder="Repeat new password" value={confirm} onChangeText={setConfirm} secureTextEntry icon="lock-closed-outline" />
          <AnimatedButton title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: 8 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { marginBottom: 16, padding: 4, alignSelf: 'flex-start' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  form: { padding: 24 },
});
