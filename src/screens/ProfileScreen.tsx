import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, subtitle, onPress, color, rightElement }: MenuItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
      <View style={[styles.menuIconBg, { backgroundColor: (color || colors.primary) + '20' }]}>
        <Ionicons name={icon} size={20} color={color || colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSub, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  };

  const stats = [
    { label: 'Orders', value: '12', icon: 'bag-handle' },
    { label: 'Reviews', value: '5', icon: 'star' },
    { label: 'Wishlist', value: '8', icon: 'heart' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#E55A26']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name={user?.role === 'admin' ? 'shield-checkmark' : 'person'} size={12} color="#fff" />
              <Text style={styles.roleText}>{user?.role === 'admin' ? 'Administrator' : 'Member'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.statsCard, { backgroundColor: colors.card }]}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
            <Ionicons name={s.icon as any} size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <MenuItem icon="person-outline" label="Edit Profile" subtitle="Update your information" />
          <MenuItem icon="location-outline" label="Addresses" subtitle="Manage delivery addresses" />
          <MenuItem icon="card-outline" label="Payment Methods" subtitle="Manage payment options" />
          <MenuItem icon="notifications-outline" label="Notifications" subtitle="Manage alerts" />
        </Animated.View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <MenuItem
            icon={isDark ? 'moon' : 'sunny'}
            label="Dark Mode"
            subtitle={isDark ? 'Enabled' : 'Disabled'}
            onPress={toggleTheme}
            rightElement={
              <View style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.surfaceVariant }]}>
                <View style={[styles.toggleThumb, isDark && styles.toggleThumbOn]} />
              </View>
            }
          />
          <MenuItem icon="language-outline" label="Language" subtitle="English (US)" />
        </Animated.View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <MenuItem icon="help-circle-outline" label="Help Center" />
          <MenuItem icon="document-text-outline" label="Terms of Service" />
          <MenuItem icon="shield-outline" label="Privacy Policy" />
          <MenuItem icon="star-outline" label="Rate the App" />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoutSection}>
        <AnimatedButton
          title={loggingOut ? 'Signing out...' : 'Sign Out'}
          onPress={handleLogout}
          loading={loggingOut}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
        />
        <Text style={[styles.version, { color: colors.textMuted }]}>MicroMarket v1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarImg: { width: 70, height: 70, borderRadius: 35 },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsCard: { marginHorizontal: 16, marginTop: 20, borderRadius: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  section: { paddingHorizontal: 16, marginTop: 28 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, gap: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  menuIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuSub: { fontSize: 12, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', padding: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  logoutSection: { padding: 20, paddingBottom: 40, marginTop: 12 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 16 },
});
