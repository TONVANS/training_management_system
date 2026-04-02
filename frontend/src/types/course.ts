// src/types/course.ts
import { TrainingFormat, LocationType, CourseStatus } from './common';
// ສົມມຸດວ່າມີການ import Category, Material, Enrollment ແລ້ວ
import { Category } from './category';
import { Material } from './material';
import { Enrollment } from './enrollment';

export interface CourseResponse {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  start_date: string;
  end_date: string;
  format: TrainingFormat;
  location_type: LocationType | null;
  location: string | null;
  country: string | null;
  budget: string; 
  status: CourseStatus;
  
  // ຂໍ້ມູນຜູ້ຝຶກສອນ ທີ່ເພີ່ມມາໃໝ່ຕາມ Schema
  trainer: string | null;
  institution: string | null;
  organization: string | null;

  created_at: string;
  updated_at: string;
  category: Category;
  materials?: Material[];
  enrollments?: Enrollment[];

  _count?: {
    enrollments: number;
    materials: number;
  };
}

export interface CourseListResponse {
  data: CourseResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  category_id: number;
  start_date: string;
  end_date: string;
  format: TrainingFormat;
  location_type?: LocationType;
  location?: string;
  country?: string;
  budget: number | string;
  status?: CourseStatus;
  
  // Field ໃໝ່
  trainer?: string;
  institution?: string;
  organization?: string;

  employee_ids?: number[];
  documents?: File[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  format?: TrainingFormat;
  location_type?: LocationType | null;
  location?: string | null;
  country?: string | null;
  budget?: number | string;
  status?: CourseStatus;

  // Field ໃໝ່
  trainer?: string;
  institution?: string;
  organization?: string;
}

export interface CourseFilterParams {
  page?: number;
  limit?: number;
  title?: string;
  category_id?: number;
  status?: CourseStatus;
  format?: TrainingFormat;
  start_date_from?: string;
  start_date_to?: string;
}

