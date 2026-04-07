// src/components/dashboard/recentTrainingTable.tsx
import React from 'react';
import { MoreVertical, Calendar, Users, Folder } from 'lucide-react';

// Adjusted to match Backend response structure
interface RecentTrainingTableProps {
  upcomingCourses?: any[];
  isLoading?: boolean;
}

const Badge = ({ status }: { status: string }) => {
  const isActive = status === 'ACTIVE' || status === 'Ongoing';
  const styles = isActive
    ? 'bg-blue-50 text-[#1275e2] border-[#1275e2]/20'
    : status === 'SCHEDULED'
      ? 'bg-amber-50 text-amber-600 border-amber-200'
      : 'bg-emerald-50 text-emerald-600 border-emerald-200';

  const label = isActive ? 'ກຳລັງດຳເນີນການ' : status === 'SCHEDULED' ? 'ລໍຖ້າເປີດສອນ' : 'ສຳເລັດແລ້ວ';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {label}
    </span>
  );
};

export function RecentTrainingTable({ upcomingCourses = [], isLoading = false }: RecentTrainingTableProps) {
  const coursesData = upcomingCourses && upcomingCourses.length > 0 ? upcomingCourses : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-full flex flex-col overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">ການຝຶກອົບຮົມໄວໆນີ້ & ກຳລັງຈັດ</h3>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Upcoming & Active Trainings</p>
        </div>
        <button className="text-sm text-[#1275e2] hover:text-[#0a468c] font-bold hover:underline transition-colors px-4 py-2 bg-blue-50 rounded-xl">
          ເບິ່ງທັງໝົດ
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : coursesData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Folder className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-medium">ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງນີ້</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">ຊື່ຫຼັກສູດ (Course)</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">ໝວດໝູ່</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">ວັນທີເລີ່ມ</th>
                <th className="px-6 py-3 font-medium text-center">ສະຖານະ</th>
                <th className="px-6 py-3 font-medium text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {coursesData.slice(0, 5).map((course) => {
                const title = course.title || 'Unknown Course';
                const dateStr = formatDate(course.start_date);
                const status = course.status || 'ACTIVE';
                const categoryName = course.category?.name || 'ທົ່ວໄປ';

                return (
                  <tr key={course.id} className="group bg-white hover:bg-gray-50/80 transition-colors shadow-sm border border-gray-100 rounded-2xl">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-gray-200">
                      <div className="font-bold text-gray-900">{title}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1 sm:hidden"><Calendar size={12} /> {dateStr}</span>
                        <span className="flex items-center gap-1"><Users size={12} className="text-[#1275e2]" /> {course.enrolled_count || 0} ຄົນ</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden sm:table-cell border-y border-gray-100 group-hover:border-gray-200">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-semibold">{categoryName}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell border-y border-gray-100 group-hover:border-gray-200 font-medium text-sm">
                      {dateStr}
                    </td>
                    <td className="px-6 py-4 text-center border-y border-gray-100 group-hover:border-gray-200">
                      <Badge status={status} />
                    </td>
                    <td className="px-6 py-4 text-right rounded-r-2xl border-y border-r border-gray-100 group-hover:border-gray-200">
                      <button className="text-gray-400 hover:text-[#1275e2] hover:bg-blue-50 p-2 rounded-xl transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}