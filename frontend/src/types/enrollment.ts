// src/types/enrollment.ts

import { CourseResponse } from '.';
import { EnrollmentStatus } from './common';

/**
 * Employee Information (minimal, from Enrollment relation)
 */
export interface Employee {
  id: number;
  employee_code?: string;
  first_name_la: string;
  last_name_la: string;
  email?: string;
  position_id?: number;
  department_id?: number;
}

/**
 * Enrollment Model
 * Represents an employee's enrollment in a course
 */
export interface Enrollment {
  id: number;
  employee_id: number;
  course_id: number;
  status: EnrollmentStatus;
  certificate_url?: string | null;
  enrolled_at: string; // ISO 8601 DateTime
  updated_at: string; // ISO 8601 DateTime
  employee?: Employee; // Populated when fetched with relation
  course?: CourseResponse; // Populated when fetched with relation
}

/**
 * Create Enrollment Request
 */
export interface CreateEnrollmentRequest {
  employee_id: number;
  course_id: number;
  status?: EnrollmentStatus;
}

/**
 * Update Enrollment Request
 */
export interface UpdateEnrollmentRequest {
  status?: EnrollmentStatus;
  certificate_url?: string;
}

/**
 * Enrollment Response from Backend
 * แก้ไข: ใช้ type alias แทน empty interface เพื่อหลีกเลี่ยง Linter Warning
 */
export type EnrollmentResponse = Enrollment;

/**
 * Enrollment List Response (paginated)
 */
export interface EnrollmentListResponse {
  data: EnrollmentResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Enrollment with full nested data
 */
export interface EnrollmentDetailsResponse extends EnrollmentResponse {
  employee: Employee;
  course: CourseResponse;
}

/**
 * Participant (Alias for Enrollment, used in UI context)
 */
export type Participant = EnrollmentResponse;