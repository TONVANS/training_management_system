/**
 * Training Category Types
 */

export interface Category {
  id: number;
  name: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}

/**
 * Category Response from Backend
 * แก้ไข: รวม Type ของ _count เข้ามาด้วย
 */
export interface CategoryResponse extends Category {
  _count?: {
    courses: number;
  };
}