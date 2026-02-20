import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

const extractAuthData = async (res: any): Promise<AuthResponse> => {
  const data = res?.data?.data;

  if (!data?.accessToken || !data?.user) {
    throw new Error('Invalid authentication response');
  }

  // Save refresh token if exists
  if (data.refreshToken) {
    await AsyncStorage.setItem('@refresh_token', data.refreshToken);
  }

  return {
    user: data.user as User,
    token: data.accessToken,
  };
};

export const authService = {
  // ============================
  // LOGIN
  // ============================
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return await extractAuthData(res);
  },

  // ============================
  // ADMIN LOGIN
  // ============================
  adminLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/admin/login', { email, password });
    return await extractAuthData(res);
  },

  // ============================
  // VERIFY OTP
  // ============================
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    return await extractAuthData(res);
  },

  // ============================
  // GOOGLE LOGIN
  // ============================
  googleLogin: async (googleToken: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/google', { token: googleToken });
    return await extractAuthData(res);
  },

  // ============================
  // REGISTER
  // ============================
  register: async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },

  // ============================
  // RESEND OTP
  // ============================
  resendOTP: async (email: string) => {
    const res = await apiClient.post('/auth/resend-otp', { email });
    return res.data;
  },

  // ============================
  // FORGOT PASSWORD
  // ============================
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  // ============================
  // RESET PASSWORD
  // ============================
  resetPassword: async (token: string, password: string) => {
    const res = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    return res.data;
  },

  // ============================
  // LOGOUT
  // ============================
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  // ============================
  // GET CURRENT USER
  // ============================
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');

    if (!res?.data?.data) {
      throw new Error('Invalid user response');
    }

    return res.data.data as User;
  },
};
