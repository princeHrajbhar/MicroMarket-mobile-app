import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // ============================
  // LOAD AUTH ON APP START
  // ============================
  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const userJson = await AsyncStorage.getItem('@auth_user');

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        setState({
          user,
          token,
          role: user.role,
          isLoading: false,
          isAuthenticated: true,
        });

        // Verify token validity
        try {
          const freshUser = await authService.getMe();
          setState((prev) => ({
            ...prev,
            user: freshUser,
          }));
          await AsyncStorage.setItem('@auth_user', JSON.stringify(freshUser));
        } catch {
          await clearAuth();
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // ============================
  // SAVE AUTH
  // ============================
  const saveAuth = async (user: User, token: string) => {
    if (!token) {
      throw new Error('Invalid token');
    }

    await AsyncStorage.setItem('@auth_token', token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user));

    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

    setState({
      user,
      token,
      role: user.role,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  // ============================
  // CLEAR AUTH
  // ============================
  const clearAuth = async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@auth_user');
    await AsyncStorage.removeItem('@refresh_token');

    delete apiClient.defaults.headers.common.Authorization;

    setState({
      user: null,
      token: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // ============================
  // LOGIN
  // ============================
  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    await saveAuth(user, token);
  };

  const adminLogin = async (email: string, password: string) => {
    const { user, token } = await authService.adminLogin(email, password);
    await saveAuth(user, token);
  };

  const googleLogin = async (googleToken: string) => {
    const { user, token } = await authService.googleLogin(googleToken);
    await saveAuth(user, token);
  };

  // ============================
  // REGISTER
  // ============================
  const register = async (name: string, email: string, password: string) => {
    return await authService.register(name, email, password);
  };

  const verifyOTP = async (email: string, otp: string) => {
    const { user, token } = await authService.verifyOTP(email, otp);
    await saveAuth(user, token);
  };

  const resendOTP = async (email: string) => {
    await authService.resendOTP(email);
  };

  // ============================
  // PASSWORD
  // ============================
  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await authService.resetPassword(token, password);
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore server error
    }
    await clearAuth();
  };

  // ============================
  // REFRESH USER
  // ============================
  const refreshUser = async () => {
    try {
      const user = await authService.getMe();
      setState((prev) => ({ ...prev, user }));
      await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
    } catch {
      await clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        adminLogin,
        register,
        verifyOTP,
        resendOTP,
        logout,
        forgotPassword,
        resetPassword,
        googleLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
