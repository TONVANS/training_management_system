// src/layout/sidebar.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard, BookOpen, GraduationCap,
    FileText, Settings, X, LogOut, User,
    PanelLeftClose, PanelLeftOpen,
    GalleryVerticalEnd, CalendarCog, UserStar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth/authStore';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;        // Mobile state
    onClose: () => void;    // Mobile close
    currentPath: string;    // ຮັບ Path ມາເຊັກ Active Menu
    isCollapsed: boolean;   // Desktop collapse state
    toggleCollapse: () => void; // Toggle function
}

const menus = [
    { name: 'ໜ້າຫຼັກ (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
    { name: 'ຫຼັກສູດຝຶກອົບຮົມ', href: '/trainings', icon: BookOpen },
    { name: 'ປະເພດການຝຶກອົບຮົມ', href: '/categories', icon: GalleryVerticalEnd },
    { name: 'ຂໍ້ມູນ ຜູ້ຝຶກອົບຮົມ', href: '/participant_lists', icon: GraduationCap },
    { name: 'ລາຍງານ (Reports)', href: '/reports', icon: FileText },
    { name: 'ຈັດການສິດ', href: '/role_management', icon: UserStar },
    { name: 'ແຈ້ງເຕືອນ', href: '/notification', icon: CalendarCog },
    { name: 'ຕັ້ງຄ່າ (Settings)', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose, currentPath, isCollapsed, toggleCollapse }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    // 📌 ປັບສີ Background ໃຫ້ກົງກັບ Auth Layout (Gradient ກົມມະທ່າ)
                    "fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-[#0a468c] to-[#0f62c0] text-white transition-all duration-300 ease-in-out shadow-2xl lg:static border-r border-white/5",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    isCollapsed ? "lg:w-20" : "lg:w-64"
                )}
            >
                {/* 📌 Background Pattern Overlay (Optional - ລາຍເສັ້ນອ່ອນໆຄືໜ້າ Login) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                    {/* Header & Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                        <div className="flex items-center overflow-hidden whitespace-nowrap">
                            {/* 📌 Logo Image ແທນຕົວໜັງສື */}
                            <div className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center mr-3 shadow-md border border-white/20 p-1">
                                <Image
                                    src="/images/logo/logo.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>

                            <span className={cn(
                                "font-bold text-lg tracking-wide transition-opacity duration-200 drop-shadow-sm",
                                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                            )}>
                                Training Record System
                            </span>
                        </div>

                        {/* Mobile Close Button */}
                        <button className="lg:hidden text-white/70 hover:text-white bg-white/5 p-1.5 rounded-lg" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {!isCollapsed && (
                            <p className="px-3 text-[11px] font-bold text-blue-200/60 uppercase tracking-widest mb-3 transition-opacity duration-300">
                                ເມນູຫຼັກ
                            </p>
                        )}
                        {menus.map((menu) => {
                            const isActive = menu.href === '/dashboard'
                                ? currentPath === '/dashboard'
                                : currentPath.startsWith(menu.href);

                            return (
                                <Link
                                    key={menu.href}
                                    href={menu.href}
                                    onClick={onClose}
                                    title={isCollapsed ? menu.name : ''}
                                    className={cn(
                                        "flex items-center px-3 py-2.5 rounded-xl transition-all group cursor-pointer border border-transparent",
                                        isActive
                                            ? "bg-white/15 text-white shadow-inner border-white/10"
                                            : "text-blue-100/70 hover:bg-white/10 hover:text-white",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <menu.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn("shrink-0", isActive ? "text-[#ffb13b]" : "text-blue-200/50 group-hover:text-blue-100")}
                                    />

                                    <span className={cn(
                                        "ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 origin-left",
                                        isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                                    )}>
                                        {menu.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Collapse Toggle Button (Desktop Only) */}
                    <div className="hidden lg:flex justify-end p-3 border-t border-white/10">
                        <button
                            onClick={toggleCollapse}
                            className="p-2 rounded-xl text-blue-200/60 hover:text-white hover:bg-white/10 transition-colors w-full flex items-center justify-center border border-transparent hover:border-white/10"
                        >
                            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/10 shrink-0 bg-black/10">
                        <div className={cn(
                            "flex items-center rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/5",
                            isCollapsed ? "justify-center p-0 h-10 w-10 mx-auto" : "gap-3 p-2.5"
                        )}>
                            <div className="w-9 h-9 shrink-0 rounded-full bg-[#1275e2] flex items-center justify-center text-white border-2 border-white/20 shadow-sm">
                                <User size={18} />
                            </div>
                            <div className={cn(
                                "flex-1 min-w-0 transition-all duration-300",
                                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                            )}>
                                <p className="text-sm font-bold text-white truncate">{user?.employee_code || "Admin User"}</p>
                                <p className="text-xs text-blue-200/70 truncate">{user?.role || "Employee"}</p>
                            </div>

                            {!isCollapsed && (
                                <button
                                    onClick={() => {
                                        logout();
                                        router.push('/login');
                                    }}
                                    className="p-1.5 text-blue-200/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="ອອກຈາກລະບົບ"
                                >
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}