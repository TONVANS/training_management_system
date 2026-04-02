// src/store/courseStore.ts
import { create } from "zustand";
import api from "@/util/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  CourseListResponse,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseFilterParams,
} from "@/types/course";

interface ApiErrorResponse {
  message: string;
}

interface CourseStoreState {
  courses: CourseResponse[];
  selectedCourse: CourseResponse | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;

  fetchCourses: (params?: CourseFilterParams) => Promise<void>;
  fetchCourseById: (id: number) => Promise<CourseResponse | null>;
  createCourse: (data: CreateCourseRequest) => Promise<CourseResponse | null>;
  updateCourse: (id: number, data: UpdateCourseRequest) => Promise<CourseResponse | null>;
  deleteCourse: (id: number) => Promise<boolean>;
  setSelectedCourse: (course: CourseResponse | null) => void;
  clearErrors: () => void;
  setPagination: (page: number, limit?: number) => void;
}

export const useCourseStore = create<CourseStoreState>()((set, get) => ({
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  fetchCourses: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const page = params?.page ?? state.page;
      const limit = params?.limit ?? state.limit;

      const response = await api.get<CourseListResponse>("/training/courses", {
        params: {
          page,
          limit,
          title: params?.title || undefined,
          category_id: params?.category_id || undefined,
          status: params?.status || undefined,
          format: params?.format || undefined,
          start_date_from: params?.start_date_from || undefined,
          start_date_to: params?.start_date_to || undefined,
        },
      });

      const { data, total } = response.data;

      set({ courses: data, total, page, limit, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch courses";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchCourseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<CourseResponse>(`/training/courses/${id}`);
      const course = response.data;
      set({ selectedCourse: course, isLoading: false });
      return course;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch course";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  createCourse: async (data) => {
    set({ isLoading: true, error: null });
    try {
      let payload: CreateCourseRequest | FormData = data;
      let headers = {};

      if (data.documents && data.documents.length > 0) {
        payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          
          if (key === "documents") {
            (value as File[]).forEach((file) => {
              (payload as FormData).append("documents", file);
            });
          } else if (key === "employee_ids") {
            (payload as FormData).append(key, JSON.stringify(value));
          } else {
            (payload as FormData).append(key, String(value));
          }
        });
        headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await api.post<CourseResponse>(
        "/training/courses",
        payload,
        { headers }
      );
      const newCourse = response.data;

      set((state) => ({
        courses: [newCourse, ...state.courses],
        total: state.total + 1,
        isLoading: false,
      }));

      toast.success("ສ້າງຫຼັກສູດສຳເລັດແລ້ວ");
      return newCourse;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to create course";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateCourse: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<CourseResponse>(
        `/training/courses/${id}`,
        data,
      );

      const updatedCourse = ((response.data as { data?: CourseResponse }).data || response.data) as CourseResponse;

      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? updatedCourse : course,
        ),
        selectedCourse:
          state.selectedCourse?.id === id
            ? updatedCourse
            : state.selectedCourse,
        isLoading: false,
      }));

      toast.success("ອັບເດດຫຼັກສູດສຳເລັດແລ້ວ");
      return updatedCourse;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update course";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/training/courses/${id}`);

      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        total: state.total - 1,
        selectedCourse:
          state.selectedCourse?.id === id ? null : state.selectedCourse,
        isLoading: false,
      }));

      toast.success("ລົບຫຼັກສູດສຳເລັດແລ້ວ");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to delete course";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  setSelectedCourse: (course) => set({ selectedCourse: course }),
  clearErrors: () => set({ error: null }),
  setPagination: (page, limit = 10) => set({ page, limit }),
}));