"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, BookOpen, User } from "lucide-react";
import React from "react";
import Image from "next/image";

export default function ClientSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "ໜ້າຫຼັກ", href: "/employee_dashboard", icon: Home },
    { label: "ຫຼັກສູດ", href: "/catalog", icon: Library },
    { label: "ການຮຽນຂອງຂ້ອຍ", href: "/my-learning", icon: BookOpen },
    { label: "ໂປຣໄຟລ໌", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── Desktop Top Navbar ── */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] z-50 h-16 transition-all">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-8">
          
          {/* 📌 Logo Section (Desktop) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
              <Image 
                src="/images/logo/logo.png" 
                alt="Lao Training Logo" 
                width={32} 
                height={32} 
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="font-extrabold text-xl text-gray-900 tracking-tight">
              Lao Training
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#1275e2]/10 text-[#1275e2] shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Navbar ── */}
      <nav className="md:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm z-50 h-14 flex items-center px-5">
        {/* 📌 Logo Section (Mobile) */}
        <div className="flex items-center gap-2.5">
           <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 overflow-hidden">
              <Image 
                src="/images/logo/logo.png" 
                alt="Lao Training Logo" 
                width={28} 
                height={28} 
                className="object-contain w-full h-full"
                priority
              />
           </div>
           <div className="font-extrabold text-lg text-gray-900 tracking-tight">
             Lao Training
           </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-28 md:pt-24 md:pb-12 grow flex flex-col">
        {children}
      </main>

      {/* ── Desktop Footer ── */}
      <footer className="hidden md:block bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-5xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 font-medium">
          <p>&copy; {new Date().getFullYear()} Lao Training System. ສະຫງວນລິຂະສິດ.</p>
          <div className="flex gap-6 mt-2 sm:mt-0">
            <Link href="#" className="hover:text-[#1275e2] transition-colors">ເງື່ອນໄຂການນຳໃຊ້</Link>
            <Link href="#" className="hover:text-[#1275e2] transition-colors">ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</Link>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Tab Bar (Floating Design) ── */}
      <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl h-16 flex justify-around items-center px-2 pointer-events-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                  isActive ? "text-[#1275e2]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-blue-50 scale-110" : "scale-100"}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-all ${isActive ? "opacity-100" : "opacity-80"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}