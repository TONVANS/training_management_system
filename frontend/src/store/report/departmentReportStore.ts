// src/store/report/departmentReportStore.ts
import { create } from "zustand";
import { DepartmentTrainingReportResponse, ReportPeriodType } from "@/types/report";
import { toast } from "sonner";
import api from "@/util/axios";

export interface Department {
  id: number;
  code: string | null;
  name: string;
  status: string | null;
}

interface DepartmentReportState {
  reportData: DepartmentTrainingReportResponse | null;
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  fetchReport: (departmentId: number, year: number, type: ReportPeriodType, value?: number) => Promise<void>;
  fetchDepartments: () => Promise<void>;
}

export const useDepartmentReportStore = create<DepartmentReportState>((set) => ({
  reportData: null,
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    try {
      const response = await api.get<Department[]>("/employees/departments/all");
      set({ departments: response.data });
    } catch (error: any) {
      console.error("Fetch departments error:", error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນພະແນກ/ຝ່າຍ");
    }
  },

  fetchReport: async (departmentId, year, type, value) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DepartmentTrainingReportResponse>("/reports/department-training", {
        params: { departmentId, year, type, value },
      });
      set({ reportData: response.data, isLoading: false });
    } catch (error: any) {
      console.error("Fetch department report error:", error);
      const message = error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານຝ່າຍ";
      set({ error: message, isLoading: false, reportData: null });
      toast.error(message);
    }
  },
}));