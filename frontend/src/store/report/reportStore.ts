// src/store/report/reportStore.ts
import { create } from "zustand";
import { TrainingReportResponse, ReportPeriodType } from "@/types/report";
import { toast } from "sonner";
import api from "@/util/axios";

interface ReportState {
  reportData: TrainingReportResponse | null;
  isLoading: boolean;
  error: string | null;
  // ເຮັດໃຫ້ value ເປັນທາງເລືອກ (optional) ໂດຍການຕື່ມ ?
  fetchReport: (year: number, type: ReportPeriodType, value?: number) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  reportData: null,
  isLoading: false,
  error: null,

  fetchReport: async (year, type, value) => {
    set({ isLoading: true, error: null });
    try {
      // ຖ້າ value ເປັນ undefined, axios ຈະບໍ່ສົ່ງ param ນີ້ໄປຫາ API ອັດຕະໂນມັດ
      const response = await api.get<TrainingReportResponse>("/reports/training", {
        params: { year, type, value },
      });
      set({ reportData: response.data, isLoading: false });
    } catch (error: any) {
      console.error("Fetch report error:", error);
      const message = error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ";
      set({ error: message, isLoading: false, reportData: null });
      toast.error(message);
    }
  },
}));