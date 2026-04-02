// src/types/report.ts
export type ReportPeriodType = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

export interface ReportInfo {
  year: number;
  period_type: ReportPeriodType;
  period_value: number | null;
  report_date: string;
}

export interface ReportSummary {
  total_technical: number;
  total_administrative: number;
  total_attendees: number;
  total_courses: number;
  total_days: number;
  total_domestic: number;
  total_international: number;
  total_online: number;
  total_onsite: number;
  total_budget: number;
}

export interface ReportDataRow {
  no: number;
  course_title: string;
  budget: number;
  attendees: {
    technical: number;
    administrative: number;
    total: number;
  };
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
  remark: string;
}

export interface TrainingReportResponse {
  report_info: ReportInfo;
  summary: ReportSummary;
  data: ReportDataRow[];
}