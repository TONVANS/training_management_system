// src/app/(client_site)/catalog/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { format } from "date-fns";
import {
  ArrowLeft, MapPin, Calendar, Monitor, Users,
  Download, Link as LinkIcon, Building2, CheckCircle2,
  FileText, Loader2, Info
} from "lucide-react";
import { toast } from "sonner";
import api from "@/util/axios";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const { availableCourses, fetchAvailableCourses, fetchMyEnrollments } = useEmployeeStore();
  const [enrolling, setEnrolling] = useState(false);

  const [materialPreviewUrl, setMaterialPreviewUrl] = useState<string | null>(null);
  const [loadingMaterialId, setLoadingMaterialId] = useState<number | null>(null);
  const [materialBlobUrls, setMaterialBlobUrls] = useState<{ [id: number]: string }>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const course = availableCourses.find((c) => c.id === courseId);

  useEffect(() => {
    if (availableCourses.length === 0) fetchAvailableCourses();
  }, [availableCourses.length, fetchAvailableCourses]);

  useEffect(() => {
    return () => { Object.values(materialBlobUrls).forEach(URL.revokeObjectURL); };
  }, [materialBlobUrls]);

  const openMaterial = async (materialId: number) => {
    if (materialBlobUrls[materialId]) {
      setMaterialPreviewUrl(materialBlobUrls[materialId]);
      return;
    }
    try {
      setLoadingMaterialId(materialId);
      const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee-portal/courses/materials/${materialId}/file`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('Load file failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setMaterialBlobUrls((prev) => ({ ...prev, [materialId]: url }));
      setMaterialPreviewUrl(url);
    } catch (err) {
      console.error('openMaterial error:', err);
      toast.error('ບໍ່ສາມາດໂຫຼດໄຟລ໌ໄດ້');
    } finally {
      setLoadingMaterialId(null);
    }
  };

  const forceDownload = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop()?.split('?')[0] || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await api.post("/enrollments", { course_id: courseId });
      toast.success("ລົງທະບຽນສຳເລັດແລ້ວ!");
      await fetchMyEnrollments();
      await fetchAvailableCourses();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "ການລົງທະບຽນລົ້ມເຫລວ.");
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນຫຼັກສູດ...</span>
      </div>
    );
  }

  const isEnrolled = course.enrollments && course.enrollments.length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">

      {/* ── Back Button ── */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1275e2] transition-colors font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> ກັບຄືນໜ້າຫຼັກສູດ
      </button>

      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">

        {/* ── Luxury Hero Banner ── */}
        <div className="bg-gradient-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-[80px] pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold border border-white/20 uppercase tracking-widest">
                {course.category?.name || "ທົ່ວໄປ"}
              </span>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm ${course.format === 'ONLINE' ? 'bg-sky-500 text-white' : 'bg-orange-500 text-white'}`}>
                {course.format === "ONLINE" ? "ຮຽນອອນລາຍ" : "ຮຽນຕົວຈິງ"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 drop-shadow-sm">{course.title}</h1>
            <p className="text-blue-100 text-base font-medium max-w-2xl leading-relaxed opacity-90">
              {course.description || "ເຂົ້າຮ່ວມຫຼັກສູດນີ້ເພື່ອພັດທະນາທັກສະ ແລະ ຍົກລະດັບຄວາມສາມາດຂອງທ່ານ."}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-10">

          {/* ── Info Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50/80 p-5 rounded-2xl flex gap-4 border border-gray-100 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-[#1275e2] shrink-0 border border-blue-200/50">
                <Calendar size={22} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">ວັນທີຈັດອົບຮົມ</p>
                <p className="text-base font-bold text-gray-900 leading-snug">
                  {format(new Date(course.start_date), "dd MMM yyyy")} <br className="hidden sm:block lg:hidden" />- {format(new Date(course.end_date), "dd MMM yyyy")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50/80 p-5 rounded-2xl flex gap-4 border border-gray-100 hover:bg-white hover:shadow-md hover:border-orange-100 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-100/50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-200/50">
                {course.format === "ONLINE" ? <Monitor size={22} strokeWidth={2.5} /> : <MapPin size={22} strokeWidth={2.5} />}
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">ສະຖານທີ່ / ຮູບແບບ</p>
                <p className="text-base font-bold text-gray-900 leading-snug">
                  {course.format === "ONLINE" ? "Online Meeting (ລິ້ງຢູຸ່ລຸ່ມນີ້)" : course.location || "ແຈ້ງໃຫ້ຊາບພາຍຫຼັງ"}
                </p>
              </div>
            </div>

            {course.trainer && (
              <div className="bg-gray-50/80 p-5 rounded-2xl flex gap-4 border border-gray-100 hover:bg-white hover:shadow-md hover:border-purple-100 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-100/50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-200/50">
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">ວິທະຍາກອນ</p>
                  <p className="text-base font-bold text-gray-900 leading-snug">{course.trainer}</p>
                </div>
              </div>
            )}

            {(course.institution || course.organization) && (
              <div className="bg-gray-50/80 p-5 rounded-2xl flex gap-4 border border-gray-100 hover:bg-white hover:shadow-md hover:border-emerald-100 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200/50">
                  <Building2 size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">ຈັດໂດຍ / ສະຖາບັນ</p>
                  <p className="text-base font-bold text-gray-900 leading-snug">
                    {course.institution || course.organization}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Details Section ── */}
          {course.description && (
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-[#1275e2]" /> ລາຍລະອຽດຫຼັກສູດ
              </h3>
              <div className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                {course.description}
              </div>
            </div>
          )}

          {/* ── Materials ── */}
          {isEnrolled && course.materials && course.materials.length > 0 && (
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#1275e2]" /> ເອກະສານ & ລິ້ງເຂົ້າຮຽນ
              </h3>
              <div className="space-y-3">
                {course.materials.map((mat) => (
                  mat.type === "PDF" ? (
                    <button
                      key={mat.id}
                      onClick={() => openMaterial(mat.id)}
                      disabled={loadingMaterialId === mat.id}
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-blue-50 hover:border-[#1275e2]/30 rounded-2xl group transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md disabled:opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1275e2] group-hover:scale-110 transition-transform">
                          {loadingMaterialId === mat.id ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                        </div>
                        <span className="text-sm font-bold text-gray-800 group-hover:text-[#1275e2] transition-colors">
                          ເອກະສານປະກອບການສອນ (PDF)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1275e2] bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-[#1275e2] group-hover:text-white transition-colors">
                        {loadingMaterialId === mat.id ? 'ກຳລັງໂຫຼດ...' : 'ເປີດເບິ່ງ'}
                      </span>
                    </button>
                  ) : (
                    <a
                      key={mat.id}
                      href={mat.file_path_or_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border-2 border-sky-50 hover:border-sky-200 rounded-2xl group transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                          <LinkIcon size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-800 group-hover:text-sky-600 transition-colors">
                          ລິ້ງສຳລັບເຂົ້າຮ່ວມ (Meeting Link)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">ເຂົ້າຮ່ວມ</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Action Bottom Bar ── */}
        <div className="p-6 md:p-8 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-500 w-full sm:w-auto text-center sm:text-left">
            ສະຖານະ: <span className={`font-bold ml-1 ${course.status === 'OPEN' ? 'text-emerald-600' : 'text-red-500'}`}>{course.status === "OPEN" ? "ເປີດຮັບລົງທະບຽນ" : "ປິດຮັບລົງທະບຽນ"}</span>
          </div>

          {isEnrolled ? (
            <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-8 py-4 rounded-xl font-extrabold text-sm w-full sm:w-auto shadow-sm">
              <CheckCircle2 size={20} strokeWidth={2.5} /> ທ່ານລົງທະບຽນສຳເລັດແລ້ວ
            </div>
          ) : (
            <button
              disabled={enrolling || course.status !== "OPEN"}
              onClick={handleEnroll}
              className="bg-gradient-to-r from-[#1275e2] to-[#0a468c] hover:from-[#0a468c] hover:to-[#0a468c] text-white px-10 py-4 rounded-xl font-extrabold text-sm shadow-lg shadow-[#1275e2]/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto"
            >
              {enrolling ? "ກຳລັງລົງທະບຽນ..." : "ລົງທະບຽນຮຽນດຽວນີ້"}
            </button>
          )}
        </div>
      </div>

      {/* ── Material Preview Modal ── */}
      {materialPreviewUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setMaterialPreviewUrl(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <div className="p-2 bg-blue-100 text-[#1275e2] rounded-lg"><FileText size={18} /></div>
                ເອກະສານປະກອບການສອນ
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => forceDownload(materialPreviewUrl, e)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-xs font-extrabold bg-[#1275e2] text-white hover:bg-[#0a468c] px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-[#1275e2]/20"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2.5} />}
                  {isDownloading ? 'ກຳລັງດາວໂຫຼດ...' : 'ດາວໂຫຼດຟຣີ'}
                </button>
                <button
                  onClick={() => setMaterialPreviewUrl(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg font-bold shadow-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-[75vh] bg-gray-100">
              <object data={`${materialPreviewUrl}#zoom=100&toolbar=1&navpanes=0`} type="application/pdf" className="w-full h-full min-h-[75vh]">
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-white">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <FileText size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">ບຣາວເຊີບໍ່ຮອງຮັບການສະແດງ PDF</h3>
                  <p className="text-sm font-medium text-gray-500 max-w-xs mb-4">ກະລຸນາກົດປຸ່ມດາວໂຫຼດເພື່ອເບິ່ງເອກະສານໃນເຄື່ອງຂອງທ່ານ</p>
                  <button onClick={(e) => forceDownload(materialPreviewUrl, e)} className="bg-[#1275e2] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#1275e2]/20">
                    ດາວໂຫຼດເອກະສານ
                  </button>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}