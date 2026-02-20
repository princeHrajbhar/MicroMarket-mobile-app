// ─────────────────────────────────────────────
// USER & AUTH TYPES
// ─────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Backend returns tokens separately
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─────────────────────────────────────────────
// PRODUCT TYPES (MATCHES BACKEND MODEL)
// ─────────────────────────────────────────────

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  createdBy: string;   // ObjectId as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// API RESPONSE STRUCTURES
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: PaginatedResult<T>;
  message?: string;
}

// ─────────────────────────────────────────────
// NAVIGATION TYPES
// ─────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  VerifyOTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  AdminStack: undefined;
  CreateProduct: undefined;
  EditProduct: { product: Product };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminLogin: undefined;
  VerifyOTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  CreateProduct: undefined;
  EditProduct: { product: Product };
};