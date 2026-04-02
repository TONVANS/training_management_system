import { cn } from "@/lib/utils";
import { StatCardProps } from "@/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ title, value, change, icon, trend = 'neutral', className }: StatCardProps) {
  return (
    <div className={cn(
      "group bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 sm:p-7 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(18,117,226,0.06)] hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between",
      className
    )}>
      {/* Subtle Decorative Blur Background */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50/40 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors pointer-events-none duration-500"></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1.5 flex-1 pr-4">
          {/* Title: ປົກຄອງຄວາມເປັນ Luxury (Clean & Light) */}
          <p className="text-[13px] font-medium text-gray-400 tracking-wide">{title}</p>

          {/* Value: ຂະໜາດພໍດີ, ບໍ່ຍັດກັນ */}
          <h3 className="text-2xl sm:text-[28px] font-bold text-gray-800 tracking-tight leading-tight truncate">
            {value}
          </h3>
        </div>

        {/* 📌 Luxury Icon Container (ກັບມາໃຊ້ແບບມີມິຕິ Gradient + Shadow) */}
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#1275e2] to-[#0a468c] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 transform group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>

      {/* Description / Change Tag: ປົກຄອງແບບ Minimal */}
      <div className="mt-6 flex items-center gap-2 relative z-10">
        {trend !== 'neutral' ? (
          <span className={cn(
            "flex items-center text-xs font-semibold px-2 py-1 rounded-md",
            trend === 'up' ? "text-emerald-600 bg-emerald-50/80" : "text-red-600 bg-red-50/80"
          )}>
            {trend === 'up' ? <TrendingUp size={14} className="mr-1" strokeWidth={2.5} /> : <TrendingDown size={14} className="mr-1" strokeWidth={2.5} />}
            {change}
          </span>
        ) : (
          <span className="flex items-center text-[13px] font-medium text-gray-400">
            <Minus size={14} className="mr-1.5 text-gray-300" strokeWidth={2} />
            <span className="truncate">{change}</span>
          </span>
        )}
      </div>
    </div>
  );
}