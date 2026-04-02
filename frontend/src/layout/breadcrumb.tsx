// src/layout/breadcrumb.tsx
import { cn } from "@/lib/utils";
import { Home, ChevronRight } from "lucide-react";
import React from "react";

// --- 1. Mapping ຊື່ URL ເປັນພາສາລາວ (Configuration) ---
const routeNameMap: Record<string, string> = {
  'dashboard': 'ໜ້າຫຼັກ (Dashboard)',
  'trainings': 'ການຝຶກອົບຮົມ (Trainings)',
  'categories': 'ປະເພດການຝຶກອົບຮົມ (Categories)',
  'assignments': 'ເພີ່ມຜູ້ເຂົ້າຮ່ວມ (Participants)',
  'profiles': 'ຂໍ້ມູນ ຜູ້ຝຶກອົບຮົມ (Profiles)',
  'reports': 'ລາຍງານ (Reports)',
  'role_management': 'ຈັດການສິດ (Role Management)',
  'settings': 'ຕັ້ງຄ່າ (Settings)',
};

// --- Breadcrumb Component ---
interface BreadcrumbProps {
  currentPath: string; // ຮັບ Path ມາຄຳນວນ
}

export function Breadcrumb({ currentPath }: BreadcrumbProps) {
  const segments = currentPath.split('/').filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isActive = index === segments.length - 1;

    return { label, href, active: isActive };
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="hidden sm:flex items-center text-sm font-medium">
      {/* Home Icon */}
      <a href="/dashboard" className="text-gray-400 hover:text-[#1275e2] transition-colors p-1 rounded-md hover:bg-blue-50">
        <Home size={18} />
      </a>

      {/* Loop ສະແດງ Breadcrumb Items */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="mx-1.5 text-gray-300" />
          <span
            className={cn(
              "px-2.5 py-1 rounded-md transition-all duration-200",
              item.active
                ? "bg-[#1275e2]/10 text-[#1275e2] font-bold shadow-sm"
                : "text-gray-500 hover:text-[#1275e2] hover:bg-gray-100 cursor-pointer"
            )}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}