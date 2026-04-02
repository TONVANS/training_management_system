// src/store/useEmployeeStore.ts
import { create } from "zustand";
import api from "@/util/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorResponse {
  message: string;
}

interface Material {
  id: number;
  type: string;
  file_path_or_link: string;
  created_at: string;
}

/**
 * Utility function to construct full certificate URL
 * Removes API prefix from base URL since uploads are served at root level
 */
const getCertificateUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseURL}${relativePath}`;
  return fullUrl;
  // let baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Remove API prefix (e.g., /api/v1) if it exists at the end
  // if (baseUrl.endsWith("/api/v1")) {
  //   baseUrl = baseUrl.replace("/api/v1", "");
  // } else if (baseUrl.endsWith("/api")) {
  //   baseUrl = baseUrl.replace("/api", "");
  // }

  // // Ensure no trailing slash
  // baseUrl = baseUrl.replace(/\/$/, "");

  // return `${baseUrl}${relativePath}`;
};

export interface PortalCourse {
  id: number;
  title: string;
  description: string | null;
  category: any;
  start_date: string;
  end_date: string;
  format: string;
  location_type: string | null;
  location: string | null;
  country: string | null;
  status: string;
  trainer: string | null;
  institution: string | null;
  organization: string | null;
  materials: Material[];
  enrollments?: { id: number }[];
}

export interface PortalEnrollment {
  id: number;
  course_id: number;
  status: string;
  certificate_url: string | null;
  enrolled_at: string;
  updated_at: string;
  course: PortalCourse;
}

// ✅ Type ສຳລັບ Certificate (ດຶງຈາກ enrollment ທີ່ມີ certificate_url)
export interface PortalCertificate {
  id: number; // enrollment id
  certificate_url: string | null;
  enrolled_at: string;
  status: string;
  course: {
    id: number;
    title: string;
    category: any;
    start_date: string;
    end_date: string;
    trainer: string | null;
    institution: string | null;
    organization: string | null;
  };
}

export interface EmployeeProfile {
  id: number;
  emp_id_ref: number | null;
  employee_code: string;
  first_name_la: string;
  last_name_la: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  gender: string;
  status: string;
  role: string;
  department: any;
  division: any;
  unit: any;
  position: any;
  positionCode: any;
  specialSubject: any;
}

interface EmployeeStoreState {
  profile: EmployeeProfile | null;
  availableCourses: PortalCourse[];
  enrollments: PortalEnrollment[];
  certificates: PortalCertificate[]; // ✅ List ທັງໝົດ
  currentCertificate: PortalCertificate | null; // ✅ ສຳລັບ enrollment ທີ່ select
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  fetchAvailableCourses: () => Promise<void>;
  fetchMyEnrollments: () => Promise<void>;
  fetchMyCertificates: () => Promise<void>; // ✅ ດຶງທັງໝົດ
  fetchCertificate: (enrollmentId: number) => Promise<void>; // ✅ ດຶງຕາມ enrollment
  uploadCertificate: (enrollmentId: number, file: File) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStoreState>((set) => ({
  profile: null,
  availableCourses: [],
  enrollments: [],
  certificates: [],
  currentCertificate: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<EmployeeProfile>(
        "/employee-portal/profile",
      );
      set({ profile: response.data, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch profile";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchAvailableCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortalCourse[]>(
        "/employee-portal/courses",
      );
      set({ availableCourses: response.data || [], isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to fetch available courses";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchMyEnrollments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortalEnrollment[]>(
        "/employee-portal/enrollments",
      );
      // Transform certificate_url to full URLs
      const enrichedEnrollments = (response.data || []).map((enrollment) => ({
        ...enrollment,
        certificate_url: getCertificateUrl(enrollment.certificate_url),
      }));
      set({ enrollments: enrichedEnrollments, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch enrollments";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // ✅ ດຶງ certificates ທັງໝົດຂອງຕົນເອງ → GET /employee-portal/certificates
  fetchMyCertificates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortalCertificate[]>(
        "/employee-portal/certificates",
      );
      // Transform certificate_url to full URLs
      const enrichedCertificates = (response.data || []).map((cert) => ({
        ...cert,
        certificate_url: getCertificateUrl(cert.certificate_url),
      }));
      set({ certificates: enrichedCertificates, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch certificates";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // ✅ ດຶງ certificate ຂອງ enrollment ໜຶ່ງ → GET /employee-portal/enrollments/:id/certificate
  fetchCertificate: async (enrollmentId: number) => {
    set({ isLoading: true, error: null, currentCertificate: null });
    try {
      const response = await api.get<PortalCertificate>(
        `/employee-portal/enrollments/${enrollmentId}/certificate`,
      );
      const enrichedCert = {
        ...response.data,
        certificate_url: getCertificateUrl(response.data.certificate_url),
      };
      set({ currentCertificate: enrichedCert, isLoading: false });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch certificate";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // ✅ Upload → POST /employee-portal/enrollments/:id/certificate
  uploadCertificate: async (enrollmentId: number, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        `/employee-portal/enrollments/${enrollmentId}/certificate`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("ອັບໂຫລດໃບຢັ້ງຢືນສຳເລັດແລ້ວ!");

      // ✅ Refresh ທັງ enrollments ແລະ certificates ພ້ອມກັນ
      const [enrollRes, certRes] = await Promise.all([
        api.get<PortalEnrollment[]>("/employee-portal/enrollments"),
        api.get<PortalCertificate[]>("/employee-portal/certificates"),
      ]);

      // Transform certificate URLs to full URLs
      const enrichedEnrollments = (enrollRes.data || []).map((enrollment) => ({
        ...enrollment,
        certificate_url: getCertificateUrl(enrollment.certificate_url),
      }));

      const enrichedCertificates = (certRes.data || []).map((cert) => ({
        ...cert,
        certificate_url: getCertificateUrl(cert.certificate_url),
      }));

      set({
        enrollments: enrichedEnrollments,
        certificates: enrichedCertificates,
        isLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "ການອັບໂຫລດລົ້ມເຫລວ";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
}));
