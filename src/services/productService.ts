import { apiClient } from './apiClient';
import { Product, ApiResponse } from '../types';

export const productService = {
  // ─────────────────────────────
  // GET ALL PRODUCTS
  // ─────────────────────────────
  getProducts: async (
    page = 1,
    search = '',
    limit = 10
  ): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>(
      '/products',
      {
        params: { page, search, limit },
      }
    );

    return res.data.data ?? [];
  },

  // ─────────────────────────────
  // GET SINGLE PRODUCT
  // ─────────────────────────────
  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(
      `/products/${id}`
    );

    return res.data.data;
  },

  // ─────────────────────────────
  // CREATE PRODUCT (ADMIN)
  // ─────────────────────────────
  createProduct: async (data: {
    title: string;
    description: string;
    price: number;
    image: string;
  }): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>(
      '/products',
      data
    );

    return res.data.data;
  },

  // ─────────────────────────────
  // UPDATE PRODUCT (ADMIN)
  // ─────────────────────────────
  updateProduct: async (
    id: string,
    data: {
      title: string;
      description: string;
      price: number;
      image: string;
    }
  ): Promise<Product> => {
    const res = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );

    return res.data.data;
  },

  // ─────────────────────────────
  // DELETE PRODUCT (ADMIN - Soft Delete)
  // ─────────────────────────────
  deleteProduct: async (
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/products/${id}`
    );

    return res.data;
  },

  // ─────────────────────────────
  // ADD TO FAVORITES (AUTH REQUIRED)
  // ─────────────────────────────
  addFavorite: async (
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>(
      `/products/${id}/favorite`
    );

    return res.data;
  },

  // ─────────────────────────────
  // REMOVE FROM FAVORITES (AUTH REQUIRED)
  // ─────────────────────────────
  removeFavorite: async (
    id: string
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/products/${id}/favorite`
    );

    return res.data;
  },

  // ─────────────────────────────
  // GET USER FAVORITES (AUTH REQUIRED)
  // ─────────────────────────────
  getFavorites: async (): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>(
      '/products/user/favorites'
    );

    return res.data.data ?? [];
  },
};