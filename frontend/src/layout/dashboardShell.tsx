"use client";
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For Mobile
  const [isCollapsed, setIsCollapsed] = useState(false);   // For Desktop

  const pathname = usePathname();

  return (
    // 📌 ແກ້ໄຂຈຸດນີ້: ປ່ຽນຈາກ h-screen w-full ມາເປັນ fixed inset-0 
    // ເພື່ອລັອກ Component ໃຫ້ຕິດແໜ້ນກັບຂອບຈໍທັງ 4 ດ້ານ ປິດການ Scroll ຂອງໜ້າເວັບຫຼັກຖາວອນ
    <div className="fixed inset-0 flex bg-[#f8fafc] font-sans overflow-hidden">

      {/* Sidebar ຈະຢູ່ຄົງທີ່ທາງຊ້າຍສະເໝີ */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={pathname}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Header ຈະຖືກລ໋ອກໄວ້ທາງເທິງ (ໃຊ້ shrink-0 ເພື່ອບໍ່ໃຫ້ມັນນ້ອຍລົງເວລາຈໍແຄບ) */}
        <div className="shrink-0">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            currentPath={pathname}
          />
        </div>

        {/* 📌 ນີ້ຄືພື້ນທີ່ດຽວທີ່ອະນຸຍາດໃຫ້ເລື່ອນໄດ້ (overflow-y-auto) ສຳລັບສະແດງເນື້ອຫາແຕ່ລະໜ້າ */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-24">
          {children}
        </main>

      </div>
    </div>
  );
}