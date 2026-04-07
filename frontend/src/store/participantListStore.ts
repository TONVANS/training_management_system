import { create } from "zustand";
import api from "@/util/axios";
import {
  Enrollment,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
} from "@/types/enrollment";
import { ParticipantData } from "@/types/participant";
import { toast } from "sonner";
import { ApiResponse } from "@/types/common";

// ==========================================
// 1. Interfaces for Employee Stats
// ==========================================
export interface EmployeeTrainingStat {
  employee_id: number;
  employee_code: string;
  full_name: string;
  department_id: number;
  department: string;
  division_id: number | null;
  division: string;
  unit_id: number | null;
  unit: string;
  position: string;
  total_courses_attended: number;
}

export interface EnrolledCourseDetail {
  enrollment_id: number;
  enrollment_status: string;
  enrolled_at: string;
  certificate_url: string | null;
  course_id: number;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  format: string;
  course_status: string;
}

export interface EmployeeCourseHistory {
  employee: {
    id: number;
    employee_code: string;
    full_name: string;
    email: string;
    department: string;
    division: string;
    unit: string;
    position: string;
    total_courses: number;
  };
  courses: EnrolledCourseDetail[];
}

// ==========================================
// 2. Pagination Interfaces
// ==========================================
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TrainingStatsPaginatedResponse {
  meta: PaginationMeta;
  data: EmployeeTrainingStat[];
}

/**
 * Participant List (Enrollment) Store State
 */
interface ParticipantListStoreState {
  // State: Enrollments
  enrollments: Enrollment[];
  selectedEnrollment: Enrollment | null;

  // State: Employee Training Stats
  trainingStats: EmployeeTrainingStat[];
  selectedEmployeeHistory: EmployeeCourseHistory | null;

  // State: Pagination (Server-side)
  paginationMeta: PaginationMeta | null;

  // Shared State
  isLoading: boolean;
  error: string | null;
  total: number;

  // Actions: Fetch Enrollments
  fetchAllEnrollments: () => Promise<void>;
  fetchEnrollmentsByCourse: (courseId: number) => Promise<void>;
  fetchEnrollmentById: (id: number) => Promise<Enrollment | null>;

  // Actions: Fetch Employee Stats
  fetchTrainingStats: (params?: { page?: number; limit?: number; employee_code?: string }) => Promise<void>;
  fetchEmployeeHistory: (employeeId: number) => Promise<EmployeeCourseHistory | null>;

  // Actions: Create
  createEnrollment: (data: CreateEnrollmentRequest) => Promise<Enrollment | null>;

  // Actions: Update
  updateEnrollment: (id: number, data: UpdateEnrollmentRequest) => Promise<Enrollment | null>;

  // Actions: Delete
  deleteEnrollment: (id: number) => Promise<boolean>;

  // Actions: State Management
  setSelectedEnrollment: (enrollment: Enrollment | null) => void;
  clearErrors: () => void;
}

/**
 * Helper: Convert Enrollment to ParticipantData for UI
 */
export function enrollmentToParticipantData(
  enrollment: Enrollment,
): ParticipantData {
  const employee = enrollment.employee;
  const course = enrollment.course;

  return {
    id: enrollment.id,
    employee_id: enrollment.employee_id,
    name: employee
      ? `${employee.first_name_la || ""} ${employee.last_name_la || ""}`.trim()
      : "Unknown",
    email: employee?.email || "",
    position: employee?.position_id ? `Position ${employee.position_id}` : "",
    department: employee?.department_id
      ? `Department ${employee.department_id}`
      : "",
    avatarUrl: "",
    enrollments_count: 1,
    join_date: enrollment.enrolled_at,
    history: course
      ? [
        {
          id: course.id,
          title: course.title || "",
          date: enrollment.enrolled_at,
          instructor: undefined,
          score: 0,
          status: enrollment.status,
          duration: 0,
        },
      ]
      : [],
  };
}

/**
 * Create Participant List Store
 */
export const useParticipantListStore = create<ParticipantListStoreState>()(
  (set) => ({
    // Initial State
    enrollments: [],
    selectedEnrollment: null,
    trainingStats: [],
    selectedEmployeeHistory: null,
    paginationMeta: null,
    isLoading: false,
    error: null,
    total: 0,

    // ==========================================
    // Fetch Methods for Employee Stats
    // ==========================================

    /**
     * ດຶງ training stats ຈາກ server ດ້ວຍ pagination ແລະ filter ຕາມ employee_code
     */
    fetchTrainingStats: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<TrainingStatsPaginatedResponse>(
          "/employees/training-stats",
          {
            params: {
              page: params?.page ?? 1,
              limit: params?.limit ?? 6,
              employee_code: params?.employee_code || undefined, // ສົ່ງຄ່າ employee_code ໄປຫາ API
            },
          },
        );

        const { meta, data } = response.data;

        set({
          trainingStats: data,
          paginationMeta: meta,
          total: meta.total,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to fetch training stats";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    fetchEmployeeHistory: async (employeeId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<EmployeeCourseHistory>(
          `/employees/${employeeId}/courses`,
        );

        const data =
          (response.data as unknown as ApiResponse<EmployeeCourseHistory>)
            .data || response.data;

        set({ selectedEmployeeHistory: data, isLoading: false });
        return data;
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message ||
          "Failed to fetch employee history";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    // ==========================================
    // Existing Enrollment Methods
    // ==========================================

    fetchAllEnrollments: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<{ data: Enrollment[] }>("/enrollments");
        const enrollments = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        set({
          enrollments,
          total: enrollments.length,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to fetch enrollments";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    fetchEnrollmentsByCourse: async (courseId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<{ data: Enrollment[] }>(
          `/training/courses/${courseId}/enrollments`,
        );
        const enrollments = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        set({
          enrollments,
          total: enrollments.length,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message ||
          "Failed to fetch course enrollments";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    fetchEnrollmentById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<{ data: Enrollment }>(
          `/enrollments/${id}`,
        );
        const enrollment = response.data.data;
        set({ selectedEnrollment: enrollment, isLoading: false });
        return enrollment;
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message ||
          "Failed to fetch enrollment details";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return null;
      }
    },

    createEnrollment: async (data: CreateEnrollmentRequest) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post<{ data: Enrollment }>(
          "/enrollments",
          data,
        );
        const newEnrollment = response.data.data;

        set((state) => ({
          enrollments: [newEnrollment, ...state.enrollments],
          total: state.total + 1,
          isLoading: false,
        }));

        toast.success("Enrollment created successfully");
        return newEnrollment;
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to create enrollment";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    updateEnrollment: async (id: number, data: UpdateEnrollmentRequest) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.put<{ data: Enrollment }>(
          `/enrollments/${id}`,
          data,
        );
        const updatedEnrollment = response.data.data;

        set((state) => ({
          enrollments: state.enrollments.map((enrollment) =>
            enrollment.id === id ? updatedEnrollment : enrollment,
          ),
          selectedEnrollment:
            state.selectedEnrollment?.id === id
              ? updatedEnrollment
              : state.selectedEnrollment,
          isLoading: false,
        }));

        toast.success("Enrollment updated successfully");
        return updatedEnrollment;
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to update enrollment";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    deleteEnrollment: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await api.delete(`/enrollments/${id}`);

        set((state) => ({
          enrollments: state.enrollments.filter(
            (enrollment) => enrollment.id !== id,
          ),
          total: state.total - 1,
          selectedEnrollment:
            state.selectedEnrollment?.id === id
              ? null
              : state.selectedEnrollment,
          isLoading: false,
        }));

        toast.success("Enrollment deleted successfully");
        return true;
      } catch (error: unknown) {
        const errorObj = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to delete enrollment";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    setSelectedEnrollment: (enrollment) => {
      set({ selectedEnrollment: enrollment });
    },

    clearErrors: () => {
      set({ error: null });
    },
  }),
);