"use client";
import { useEffect, useMemo } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { BookOpen, CheckCircle, Clock, ArrowRight, Flame, Target } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile, enrollments, isLoading, fetchProfile, fetchMyEnrollments } = useEmployeeStore();

  useEffect(() => {
    fetchProfile();
    fetchMyEnrollments();
  }, [fetchProfile, fetchMyEnrollments]);

  const stats = useMemo(() => {
    const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;
    const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
    return { inProgress, completed, total: enrollments.length };
  }, [enrollments]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    IN_PROGRESS: { label: "ກຳລັງຮຽນ", color: "text-amber-700", bg: "bg-amber-50" },
    COMPLETED: { label: "ສຳເລັດແລ້ວ", color: "text-emerald-700", bg: "bg-emerald-50" },
    ENROLLED: { label: "ລົງທະບຽນແລ້ວ", color: "text-blue-700", bg: "bg-blue-50" },
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      {/* ── Luxury Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] text-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-blue-900/10 overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ffb13b]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md shadow-sm">
              <Flame size={16} className="text-[#ffb13b]" fill="currentColor" />
            </span>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest drop-shadow-sm">ສືບຕໍ່ພັດທະນາຕົນເອງ!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-2">
            ສະບາຍດີ, {profile?.first_name_la ?? "ທ່ານ"} {profile?.last_name_la}!
          </h1>
          <p className="text-sm md:text-base text-blue-100/90 max-w-md font-medium">
            ພ້ອມທີ່ຈະຮຽນຮູ້ສິ່ງໃໝ່ໆ ແລະ ຍົກລະດັບທັກສະຂອງທ່ານແລ້ວຫຼືຍັງ?
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: Clock, label: "ກຳລັງດຳເນີນການ", value: stats.inProgress, accent: "text-amber-500", bg: "from-amber-50 to-orange-50/50", iconBg: "bg-amber-100/50" },
          { icon: CheckCircle, label: "ຮຽນສຳເລັດແລ້ວ", value: stats.completed, accent: "text-emerald-500", bg: "from-emerald-50 to-green-50/50", iconBg: "bg-emerald-100/50" },
          { icon: BookOpen, label: "ລົງທະບຽນທັງໝົດ", value: stats.total, accent: "text-blue-500", bg: "from-blue-50 to-indigo-50/50", iconBg: "bg-blue-100/50" },
        ].map(({ icon: Icon, label, value, accent, bg, iconBg }) => (
          <div key={label} className={`bg-gradient-to-br ${bg} border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} shadow-sm shrink-0`}>
              <Icon size={26} className={accent} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 p-6 md:p-8 overflow-hidden relative">
        <Target className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">ການເຄື່ອນໄຫວຫຼ້າສຸດ</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">ປະຫວັດການລົງທະບຽນຂອງຂ້ອຍ</p>
          </div>
          <Link href="/my-learning" className="flex items-center gap-1 text-sm font-bold text-[#1275e2] hover:text-[#0a468c] hover:underline transition-colors bg-blue-50 px-3 py-1.5 rounded-xl">
            ເບິ່ງທັງໝົດ <ArrowRight size={14} />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center relative z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpen size={28} className="text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-700">ຍັງບໍ່ມີປະຫວັດການຮຽນ</p>
            <p className="text-sm text-gray-400 mt-1 font-medium mb-6">ຄົ້ນຫາຫຼັກສູດທີ່ໜ້າສົນໃຈເພື່ອເລີ່ມຕົ້ນພັດທະນາຕົນເອງ</p>
            <Link href="/catalog" className="inline-flex items-center justify-center bg-[#1275e2] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#0a468c] transition-colors">
              ໄປທີ່ໜ້າຫຼັກສູດ
            </Link>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {enrollments.slice(0, 5).map((enrollment) => {
              const cfg = statusConfig[enrollment.status] ?? { label: enrollment.status, color: "text-gray-600", bg: "bg-gray-100" };
              return (
                <div
                  key={enrollment.id}
                  className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#1275e2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-[#1275e2] to-[#4fa3f7] rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#1275e2] transition-colors truncate">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 mt-1">ຮູບແບບ: {enrollment.course.format === 'ONLINE' ? 'ອອນລາຍ' : 'ຕົວຈິງ'}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-center flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl ${cfg.bg} ${cfg.color} border border-current/10`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}