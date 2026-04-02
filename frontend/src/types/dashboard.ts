/**
 * Dashboard Analytics and Metrics Types
 */

/**
 * Dashboard Overview Stats
 * Top-level metrics about the training system
 */
export interface DashboardOverview {
  total_employees: number;
  total_courses: number;
  active_courses: number;
  upcoming_courses: number;
  total_enrollments: number;
  total_annual_budget_used: number;
}

/**
 * Enrollment Status Breakdown
 * Count of enrollments by status
 */
export interface EnrollmentBreakdown {
  enrolled: number;
  in_progress: number;
  completed: number;
  failed: number;
}

/**
 * Course Format Breakdown
 * Count of courses by format
 */
export interface CourseFormatBreakdown {
  online: number;
  onsite: number;
}

/**
 * Upcoming Course Details
 */
export interface UpcomingCourse {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  start_date: string; // ISO 8601 DateTime
  days_until_start: number;
  enrolled_count: number;
  status: string;
  format: string;
  location?: string;
  budget: string | number;
}

/**
 * Top Performing Course
 */
export interface TopPerformingCourse {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
}

/**
 * Department Statistics
 */
export interface DepartmentStatistic {
  department_id: number;
  department_name: string;
  total_employees: number;
  trained_employees: number;
  training_percentage: number;
}

/**
 * Complete Dashboard Data
 * All analytics and metrics combined
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
 * Dashboard Response from Backend
 */
export interface DashboardResponse {
  statusCode: number;
  message: string;
  data: DashboardData;
}
