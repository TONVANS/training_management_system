/**
 * Dashboard Store
 * Zustand store for managing dashboard state and analytics data
 */

import { create } from "zustand";
import api from "@/util/axios";
import {
  DashboardOverview,
  EnrollmentBreakdown,
  CourseFormatBreakdown,
  UpcomingCourse,
  TopPerformingCourse,
  DepartmentStatistic,
} from "@/types/dashboard";
import { toast } from "sonner";

/**
 * Backend department stat response
 */
interface BackendDepartmentStat {
  department_id: number;
  department_name?: string;
  total_employees: number;
  completed_enrollments: number;
  completion_rate: number;
}

/**
 * Complete Dashboard Data
 */
export interface DashboardData {
  overview: DashboardOverview;
  enrollment_breakdown: EnrollmentBreakdown;
  course_format_breakdown: CourseFormatBreakdown;
  upcoming_courses: UpcomingCourse[];
  top_performing_courses: TopPerformingCourse[];
  department_statistics: DepartmentStatistic[];
}

/**
 * Dashboard Store State
 */
interface DashboardStoreState {
  // State
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refreshedAt: string | null;
  dateFilter: {
    startDate: string | null;
    endDate: string | null;
  };

  // Actions: Fetch
  fetchDashboardData: (startDate?: string, endDate?: string) => Promise<void>;
  refetch: () => Promise<void>;
  setDateFilter: (startDate: string | null, endDate: string | null) => void;
  clearDateFilter: () => void;

  // Actions: State Management
  clearErrors: () => void;
  setDashboardData: (data: DashboardData | null) => void;
}

/**
 * Create Dashboard Store
 */
export const useDashboardStore = create<DashboardStoreState>()(
  (set, get) => ({
    // Initial State
    dashboardData: null,
    isLoading: false,
    error: null,
    refreshedAt: null,
    dateFilter: {
      startDate: null,
      endDate: null,
    },

    // Fetch dashboard data from API
    fetchDashboardData: async (startDate?: string, endDate?: string) => {
      set({ isLoading: true, error: null });
      try {
        // Store the date filter in state
        if (startDate || endDate) {
          set({
            dateFilter: {
              startDate: startDate || null,
              endDate: endDate || null,
            },
          });
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const queryString = params.toString();
        const metricsUrl = `/dashboard/metrics${queryString ? '?' + queryString : ''}`;
        const upcomingUrl = `/dashboard/upcoming${queryString ? '?' + queryString : ''}`;
        const topCoursesUrl = `/dashboard/top-courses${queryString ? '?' + queryString : ''}`;

        const [
          metricsRes,
          upcomingRes,
          topCoursesRes,
          deptStatsRes
        ] = await Promise.all([
          api.get(metricsUrl),
          api.get(upcomingUrl),
          api.get(topCoursesUrl),
          api.get("/dashboard/department-stats")
        ]);

        const metricsData = metricsRes.data;
        
        const data: DashboardData = {
          overview: metricsData.overview,
          enrollment_breakdown: metricsData.enrollments?.by_status || { enrolled: 0, in_progress: 0, completed: 0, failed: 0 },
          course_format_breakdown: metricsData.courses?.by_format || { online: 0, onsite: 0 },
          upcoming_courses: upcomingRes.data?.courses || [],
          top_performing_courses: topCoursesRes.data || [],
          // Map backend stats to the frontend expected types
          department_statistics: (deptStatsRes.data || []).map((stat: BackendDepartmentStat) => ({
            department_id: stat.department_id,
            department_name: stat.department_name || `Dept ${stat.department_id}`, // backend doesn't return name
            total_employees: stat.total_employees,
            trained_employees: stat.completed_enrollments,
            training_percentage: stat.completion_rate
          }))
        };

        set({
          dashboardData: data,
          isLoading: false,
          refreshedAt: new Date().toISOString(),
        });
      } catch (error: unknown) {
        const errorObj = error as { response?: { data?: { message?: string } } };
        const errorMessage =
          errorObj?.response?.data?.message || "Failed to fetch dashboard data";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        throw error;
      }
    },

    // Refetch dashboard data
    refetch: async () => {
      const { dateFilter } = get();
      await get().fetchDashboardData(dateFilter.startDate || undefined, dateFilter.endDate || undefined);
    },

    // Set date filter
    setDateFilter: (startDate: string | null, endDate: string | null) => {
      set({
        dateFilter: {
          startDate,
          endDate,
        },
      });
    },

    // Clear date filter
    clearDateFilter: () => {
      set({
        dateFilter: {
          startDate: null,
          endDate: null,
        },
      });
    },

    // Clear errors
    clearErrors: () => {
      set({ error: null });
    },

    // Set dashboard data directly (useful for testing or manual updates)
    setDashboardData: (data) => {
      set({ dashboardData: data });
    },
  }),
);
