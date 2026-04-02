/**
 * Shared Enums and Common Types for the Training Management System
 */

/**
 * Training Format Enum
 * Determines how the training is conducted
 */
export enum TrainingFormat {
  ONLINE = 'ONLINE',
  ONSITE = 'ONSITE',
}

/**
 * Location Type Enum
 * Only applicable for ONSITE training
 */
export enum LocationType {
  DOMESTIC = 'DOMESTIC',
  INTERNATIONAL = 'INTERNATIONAL',
}

/**
 * Course Status Enum
 * Represents the lifecycle state of a course
 */
export enum CourseStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Enrollment Status Enum
 * Represents the enrollment state of an employee in a course
 */
export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Material Type Enum
 * Type of course material
 */
export enum MaterialType {
  PDF = 'PDF',
  URL = 'URL',
}

/**
 * Pagination Request
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Pagination Response
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
