// src/types/report.ts

export type ReportPeriodType = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

export interface AttendeeGroup {
  male: number;
  female: number;
  total: number;
}

export interface ReportAttendees {
  technical: AttendeeGroup;
  administrative: AttendeeGroup;
  total: AttendeeGroup;
}

export interface ReportDataRow {
  no: number;
  course_title: string;
  budget: number;
  attendees: ReportAttendees; // ✅ โครงสร้างใหม่
  duration: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  location: {
    is_domestic: boolean;
    is_international: boolean;
    detail: string;
  };
  institution: string;
  format: string;
}

export interface ReportSummary {
  // ເຕັກນິກ
  total_technical_male: number;
  total_technical_female: number;
  total_technical: number;
  // ບໍລິຫານ
  total_administrative_male: number;
  total_administrative_female: number;
  total_administrative: number;
  // ລວມ
  total_male: number;
  total_female: number;
  total_attendees: number;
  // ອື່ນໆ
  total_courses: number;
  total_days: number;
  total_domestic: number;
  total_international: number;
  total_online: number;
  total_onsite: number;
  total_budget: number;
}

export interface ReportInfo {
  year: number;
  period_type: ReportPeriodType;
  period_value: number | null;
  report_date: string;
}

export interface TrainingReportResponse {
  report_info: ReportInfo;
  summary: ReportSummary;
  data: ReportDataRow[];
}

//(ເພີ່ມໃຊ້ສຳລັບລາຍງານແຍກຕາມຝ່າຍ)

export interface AttendeeDetail {
  employee_code: string;
  full_name: string;
  position: string;
  department: string;
}

export interface DepartmentReportDataRow extends Omit<ReportDataRow, "attendees"> {
  attendees: ReportAttendees;
  attendee_list: AttendeeDetail[]; // ເພີ່ມລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ
}

export interface DepartmentTrainingReportResponse {
  report_info: ReportInfo & {
    department: { id: number; name: string }; // ເພີ່ມຂໍ້ມູນຝ່າຍ
  };
  summary: ReportSummary;
  data: DepartmentReportDataRow[];
}