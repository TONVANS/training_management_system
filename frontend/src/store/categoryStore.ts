// src/store/categoryStore.ts
import { create } from "zustand";
import api from "@/util/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

interface ApiErrorResponse {
  message: string;
}

interface CategoryStoreState {
  categories: CategoryResponse[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<CategoryResponse | null>;
  updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<CategoryResponse | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  clearErrors: () => void;
}

export const useCategoryStore = create<CategoryStoreState>()((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<CategoryResponse[]>("/training/categories");
      set({ categories: response.data || [], isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to fetch categories";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<CategoryResponse>("/categories", data);
      const newCategory = response.data;

      set((state) => ({
        categories: [newCategory, ...state.categories],
        isLoading: false,
      }));

      toast.success("ສ້າງໝວດໝູ່ສຳເລັດແລ້ວ");
      return newCategory;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to create category";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<CategoryResponse>(`/categories/${id}`, data);
      const updatedCategory = response.data;

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
        isLoading: false,
      }));

      toast.success("ອັບເດດໝວດໝູ່ສຳເລັດແລ້ວ");
      return updatedCategory;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to update category";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/categories/${id}`);

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        isLoading: false,
      }));

      toast.success("ລົບໝວດໝູ່ສຳເລັດແລ້ວ");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || "Failed to delete category";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearErrors: () => set({ error: null }),
}));