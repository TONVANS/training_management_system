// src/store/auth/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/util/axios';
import { AuthState } from '@/types/auth';

const TOKEN_DURATION = 3 * 60 * 60 * 1000; // 3 ชั่วโมง (ms)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiry: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      // 📌 ເພີ່ມຟັງຊັນປ່ຽນລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ປັດຈຸບັນ
      changePassword: async (old_password: string, new_password: string) => {
        try {
          const response = await api.post('/auth/change-password', {
            old_password,
            new_password
          });
          return response.data; // ສົ່ງຂໍ້ມູນກັບໄປໃຫ້ Component ເພື່ອແຈ້ງເຕືອນ
        } catch (error: any) {
          const message = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ';
          throw new Error(message);
        }
      },

      resetEmployeePassword: async (employee_code: string) => {
        try {
          await api.post('/auth/reset-password', { employee_code });
        } catch (error: unknown) {
          const message =
            error instanceof Error && 'response' in error
              ? (error as any).response?.data?.message
              : 'Failed to reset password';
          throw new Error(message);
        }
      },

      login: async (employee_code, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { employee_code, password });
          const { employee, accessToken } = response.data;

          set({
            user: employee,
            token: accessToken,
            tokenExpiry: Date.now() + TOKEN_DURATION,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error && 'response' in error
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
          set({ error: message ?? 'Login failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, tokenExpiry: null, isAuthenticated: false });
      },

      checkTokenExpiry: () => {
        const { tokenExpiry, logout } = get();
        if (tokenExpiry && Date.now() > tokenExpiry) {
          logout();
          return false;
        }
        return true;
      },

      initialize: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.isHydrated = true;
          if (state.tokenExpiry && Date.now() > state.tokenExpiry) {
            state.token = null;
            state.tokenExpiry = null;
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);