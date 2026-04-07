// src/types/material.ts

/**
 * CourseMaterial Model
 * Represents training materials attached to a course
 */

enum MaterialType {
  PDF = 'PDF',
  URL = 'URL',
}
export interface Material {
  id: number;
  course_id: number;
  type: MaterialType;
  file_path_or_link: string;
  created_at: string; // ISO 8601 DateTime
}

/**
 * Create Material Request
 */
export interface CreateMaterialRequest {
  course_id: number;
  type: MaterialType;
  file_path_or_link: string;
}

/**
 * Update Material Request
 */
export interface UpdateMaterialRequest {
  type?: MaterialType;
  file_path_or_link?: string;
}

/**
 * Material Response from Backend
 */
export type MaterialResponse = Material;