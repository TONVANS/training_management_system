/**
 * Types for Participant and Employee Training Data
 */

// ==========================================
// 1. UI Display Types (Mapped Data)
// ==========================================

/**
 * Represents a single course history entry for a participant in the UI.
 */
export interface CourseHistoryItem {
  id: number;
  title: string;
  date: string; // ISO date string
  instructor?: string;
  score: number;
  status: string; // e.g., "ENROLLED", "IN_PROGRESS", "COMPLETED"
  duration: number; // in hours or minutes
}

/**
 * Formatted participant data used primarily for UI display (e.g., tables, cards, modals).
 */
export interface ParticipantData {
  id: number; // Enrollment ID
  employee_id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  avatarUrl: string;
  enrollments_count: number;
  join_date: string; // ISO date string
  history: CourseHistoryItem[];
}

// ==========================================
// 2. API Response Types (Employee Stats)
// ==========================================

/**
 * Data structure for GET /employees/training-stats
 */
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

/**
 * Details of a course inside the employee course history.
 * Used in GET /employees/${employee_code}/courses
 */
export interface EnrolledCourseDetail {
  enrollment_id: number;
  enrollment_status: string;
  enrolled_at: string;
  certificate_url: string | null;
  course_id: number;
  title: string;
  category: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  format: string; // e.g., "ONLINE", "ONSITE"
  course_status: string; // e.g., "ACTIVE", "SCHEDULED"
}

/**
 * Data structure for GET /employees/${employee_code}/courses
 */
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