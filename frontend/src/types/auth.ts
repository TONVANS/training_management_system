// frontend/src/types/auth.ts

export interface User {
  id: string;
  employee_code: string;
  role: string;
  // add other fields as necessary
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  tokenExpiry: number | null;

  // 📌 ຟັງຊັນເດີມທີ່ມີຢູ່ແລ້ວ
  login: (employee_code: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  checkTokenExpiry: () => boolean; // ເພີ່ມເຂົ້າໄປນຳ ເພາະເຫັນໃນ authStore ມີການປະກາດໃຊ້

  // 📌 ຟັງຊັນໃໝ່ທີ່ເພີ່ມເຂົ້າມາສຳລັບຈັດການລະຫັດຜ່ານ
  changePassword: (old_password: string, new_password: string) => Promise<any>;
  resetEmployeePassword: (employee_code: string) => Promise<void>;
}

export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface ChangeRoleRequest {
  employee_code: string;
  new_role: Role | string;
}

export interface EmployeeInfo {
  id: number;
  employee_code: string;
  email: string | null;
  first_name_la: string;
  last_name_la: string;
  role: string;
}

export interface PaginatedEmployeeResponse {
  data: EmployeeInfo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}