"use client";

import { useEffect, useState } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { format } from "date-fns";
import { MapPin, Calendar, Monitor, Users, Library, Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const { availableCourses, isLoading, fetchAvailableCourses } = useEmployeeStore();
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAvailableCourses();
  }, [fetchAvailableCourses]);

  const filtered = availableCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && availableCourses.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດຫຼັກສູດ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* ── Header & Search ── */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">ຫຼັກສູດທັງໝົດ</h1>
          <p className="text-sm font-medium text-gray-400 mt-1.5">
            ຄົ້ນຫາ ແລະ ລົງທະບຽນວິຊາທີ່ທ່ານສົນໃຈເພື່ອພັດທະນາທັກສະ
          </p>
        </div>

        <div className="relative w-full md:w-80 shrink-0 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1275e2] transition-colors" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຊື່ຫຼັກສູດ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1275e2]/20 focus:border-[#1275e2] transition-all"
          />
        </div>
      </div>

      {/* ── Courses Grid ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-[#1275e2]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            onClick={() => router.push(`/catalog/${course.id}`)}
          >
            {/* 📌 Card Image Placeholder / Accent Banner */}
            <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center">
                <Library size={40} className="text-blue-200/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1275e2] to-[#0a468c]" />
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#1275e2]/10 text-[#1275e2] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {course.category?.name || "ທົ່ວໄປ"}
                </span>
                <span
                  className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
                    course.format === "ONLINE"
                      ? "bg-sky-50 text-sky-600 border border-sky-100"
                      : "bg-orange-50 text-orange-600 border border-orange-100"
                  }`}
                >
                  {course.format === "ONLINE" ? "ອອນລາຍ" : "ຕົວຈິງ"}
                </span>
              </div>

              {/* Title & Description */}
              <div className="mb-6 flex-1">
                <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#1275e2] transition-colors line-clamp-2">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-sm font-medium text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs font-medium text-gray-600 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                     <Calendar size={14} className="text-[#1275e2]" />
                  </div>
                  <span className="truncate">
                    {format(new Date(course.start_date), "dd MMM yyyy")} – {format(new Date(course.end_date), "dd MMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${course.format === 'ONLINE' ? 'bg-sky-50 text-sky-500' : 'bg-orange-50 text-orange-500'}`}>
                    {course.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />}
                  </div>
                  <span className="truncate">
                    {course.format === "ONLINE"
                      ? course.location || "Online Meeting"
                      : course.location_type === "INTERNATIONAL"
                      ? course.country
                      : course.location || "ແຈ້ງໃຫ້ຊາບພາຍຫຼັງ"}
                  </span>
                </div>
              </div>

              {/* View Detail Button */}
              <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-[#1275e2] text-gray-700 hover:text-white text-sm font-bold py-3.5 rounded-xl transition-colors group-hover:shadow-md">
                ລາຍລະອຽດ <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* ── Empty State ── */}
        {filtered.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {search ? "ບໍ່ພົບຫຼັກສູດທີ່ຄົ້ນຫາ" : "ຍັງບໍ່ມີຫຼັກສູດເປີດສອນ"}
            </h3>
            <p className="text-sm font-medium text-gray-500">
              {search
                ? "ກະລຸນາລອງໃຊ້ຄຳຄົ້ນຫາອື່ນ"
                : "ຂະນະນີ້ຍັງບໍ່ມີວິຊາທີ່ເປີດໃຫ້ບໍລິການ ກະລຸນາກັບມາເບິ່ງໃໝ່ພາຍຫຼັງ"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}