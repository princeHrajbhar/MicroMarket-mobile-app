import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen() {
  const { colors } = useTheme();
  const { verifyOTP, resendOTP } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { email } = route.params;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const refs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) {
      // Paste support
      const chars = text.slice(0, OTP_LENGTH).split('');
      const next = [...otp];
      chars.forEach((c, i) => { if (idx + i < OTP_LENGTH) next[idx + i] = c; });
      setOtp(next);
      refs.current[Math.min(idx + chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...otp];
    next[idx] = text;
    setOtp(next);
    if (text && idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { Alert.alert('Error', 'Please enter complete OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(email, code);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOTP(email);
      setResendTimer(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={['#FF6B35', '#E55A26']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.headerTitle}>Verify Email 📧</Text>
          <Text style={styles.headerSub}>We sent a 6-digit code to</Text>
          <Text style={styles.email}>{email}</Text>
        </Animated.View>
      </LinearGradient>

      <View style={[styles.form, { paddingTop: 36 }]}>
        <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { if (r) refs.current[idx] = r; }}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: digit ? colors.primary : colors.border,
                  color: colors.text,
                },
              ]}
              maxLength={OTP_LENGTH}
              keyboardType="numeric"
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <AnimatedButton title="Verify OTP" onPress={handleVerify} loading={loading} style={styles.btn} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.resendRow}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
            <Text style={[styles.resendLink, { color: resendTimer > 0 ? colors.textMuted : colors.primary }]}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { marginBottom: 16, padding: 4, alignSelf: 'flex-start' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  email: { fontSize: 15, color: '#fff', fontWeight: '700', marginTop: 4 },
  form: { padding: 24 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpBox: {
    width: 50,
    height: 58,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '700',
    borderWidth: 2,
  },
  btn: { marginBottom: 24 },
  resendRow: { flexDirection: 'row', justifyContent: 'center' },
  resendText: { fontSize: 14 },
  resendLink: { fontSize: 14, fontWeight: '700' },
});
