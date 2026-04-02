// src/store/roleStore.ts
import { create } from 'zustand';
import api from '@/util/axios';
import { toast } from 'sonner';
import { ChangeRoleRequest, EmployeeInfo, PaginatedEmployeeResponse } from '@/types/auth';

interface RoleState {
  employees: EmployeeInfo[]; // ສຳລັບສະແດງລາຍຊື່ໃນຕາຕະລາງ (ຖ້າມີ API ດຶງຂໍ້ມູນພະນັກງານທັງໝົດ)
  isLoading: boolean;
  isSubmitting: boolean;

  // 📌 State ສຳລັບ Pagination
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  fetchEmployees: (page?: number, limit?: number, search?: string) => Promise<void>;
  changeRole: (data: ChangeRoleRequest) => Promise<void>;

  // 📌 1. ເພີ່ມ Method ສຳລັບຣີເຊັດລະຫັດຜ່ານເຂົ້າໃນ Interface
  resetPassword: (employee_code: string) => Promise<void>;
}

export const useRoleStore = create<RoleState>((set) => ({
  employees: [],
  isLoading: false,
  isSubmitting: false,

  total: 0,
  page: 1,
  limit: 6,
  totalPages: 1,

  fetchEmployees: async (page = 1, limit = 6, search = "") => {
    set({ isLoading: true });
    try {
      const response = await api.get<PaginatedEmployeeResponse>('/employees', {
        params: { page, limit, search }
      });

      set({
        employees: response.data.data,
        total: response.data.meta.total,
        page: response.data.meta.page,
        limit: response.data.meta.limit,
        totalPages: response.data.meta.totalPages,
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch employees failed:', error);
      set({ isLoading: false });
    }
  },

  changeRole: async (data: ChangeRoleRequest) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/change-role', data);
      toast.success(response.data.message || 'ປ່ຽນສິດການເຂົ້າເຖິງສຳເລັດແລ້ວ');

      // ອັບເດດ State ໃນຕາຕະລາງທັນທີ (ແຖວທີ່ຖືກປ່ຽນ)
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.employee_code === data.employee_code
            ? { ...emp, role: data.new_role }
            : emp
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສິດ';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // 📌 2. ສ້າງ Logic ສຳລັບການເອີ້ນ API ຣີເຊັດລະຫັດຜ່ານ
  resetPassword: async (employee_code: string) => {
    set({ isSubmitting: true });
    try {
      const response = await api.post('/auth/reset-password', { employee_code });
      // ໃຊ້ toast.success ແທນການໃຊ້ alert ປົກກະຕິ ເພື່ອຄວາມງາມ
      toast.success(response.data?.message || `ຣີເຊັດລະຫັດຜ່ານສຳລັບ ${employee_code} ສຳເລັດແລ້ວ!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ';
      toast.error(message);
      throw error; // ໂຍນ Error ອອກໄປໃຫ້ Component ຮັບຮູ້ (ຖ້າຕ້ອງການ)
    } finally {
      set({ isSubmitting: false });
    }
  },
}));