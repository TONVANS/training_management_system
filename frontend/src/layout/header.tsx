// src/layout/header.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, KeyRound, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { Breadcrumb } from './breadcrumb';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth/authStore';
import { toast } from 'sonner';

// 📌 Import UI Components ຂອງ Shadcn
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  currentPath: string;
}

export function Header({ onMenuClick, currentPath }: HeaderProps) {
  const { user, logout, changePassword } = useAuthStore();
  const router = useRouter();

  // 📌 States ສຳລັບ Dropdown Menu & Dialog
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 📌 States ສຳລັບ Form ປ່ຽນລະຫັດຜ່ານ
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // ຈັດການປິດ Dropdown ເວລາກົດບ່ອນອື່ນ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) return toast.error("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
    if (newPassword.length < 6) return toast.error("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
    if (newPassword !== confirmPassword) return toast.error("ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ");

    setIsSubmittingPwd(true);
    try {
      const result = await changePassword(oldPassword, newPassword);
      toast.success(result?.message || "ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!");
      
      // Reset Form
      setIsChangePwdOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ");
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:text-[#1275e2] hover:bg-blue-50 rounded-xl lg:hidden focus:outline-none transition-colors"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb currentPath={currentPath} />
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Search Box */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1275e2] transition-colors" size={18} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຫຼັກສູດ..."
            className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-50/80 border-2 border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1275e2] transition-all font-medium text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <button className="p-2.5 text-gray-400 hover:text-[#1275e2] hover:bg-blue-50 rounded-xl relative transition-colors border border-transparent hover:border-blue-100">
          <Bell size={20} strokeWidth={2.5} />
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* ── 📌 User Dropdown Menu ── */}
        <div className="relative" ref={menuRef}>
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 select-none"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#1275e2] to-[#0a468c] rounded-lg flex items-center justify-center text-white shadow-sm border border-blue-200/50">
              <User size={18} strokeWidth={2.5} />
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} strokeWidth={3} />
          </div>

          {/* Dropdown Content */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-gray-50 mb-1 flex flex-col">
                <span className="text-sm font-extrabold text-gray-900 truncate">
                  {user?.employee_code || "Admin User"}
                </span>
                <span className="text-xs font-medium text-gray-500 truncate mt-0.5">
                  {user?.role === "ADMIN" ? "ຜູ້ເບິ່ງແຍງລະບົບ" : "ຜູ້ໃຊ້ທົ່ວໄປ"}
                </span>
              </div>
              
              <div className="px-2 space-y-1">
                <button 
                  onClick={() => { setIsChangePwdOpen(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:text-[#1275e2] hover:bg-blue-50 rounded-xl transition-colors group"
                >
                  <KeyRound size={16} className="text-gray-400 group-hover:text-[#1275e2]" strokeWidth={2.5} />
                  ປ່ຽນລະຫັດຜ່ານ
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                >
                  <LogOut size={16} className="text-red-400 group-hover:text-red-600" strokeWidth={2.5} />
                  ອອກຈາກລະບົບ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 📌 Change Password Dialog (Compact Version) ── */}
      <Dialog open={isChangePwdOpen} onOpenChange={setIsChangePwdOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl md:rounded-[2rem] p-5 sm:p-6 overflow-hidden border-0 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
          
          <DialogHeader className="flex flex-col items-center text-center pb-0">
            <div className="w-12 h-12 bg-blue-50/80 border border-blue-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
              <KeyRound className="text-[#1275e2]" size={24} strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight">
              ປ່ຽນລະຫັດຜ່ານ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1 font-medium">
              ປ້ອນລະຫັດຜ່ານເກົ່າ ແລະ ກຳນົດລະຫັດຜ່ານໃໝ່ລຸ່ມນີ້
            </DialogDescription>
          </DialogHeader>

          <form id="header-change-pwd-form" onSubmit={handleChangePassword} className="grid gap-2 py-2">
            {/* ── 1. ສ່ວນຂອງລະຫັດເກົ່າ ── */}
            <div className="space-y-1.5 text-left px-1">
              <Label htmlFor="old_password_h" className="text-xs font-bold text-gray-700 ml-1">
                ລະຫັດຜ່ານເກົ່າ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="old_password_h"
                type="password"
                placeholder="ປ້ອນລະຫັດຜ່ານປັດຈຸບັນ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="h-10 rounded-xl border-gray-200 bg-gray-50/50 focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400 transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            {/* ── 2. ເສັ້ນຂັ້ນກາງ (Divider) ── */}
            <div className="relative flex items-center py-1.5">
              <div className="flex-grow border-t border-dashed border-gray-300"></div>
              <div className="flex-shrink-0 mx-3 text-[10px] font-extrabold text-[#1275e2] uppercase tracking-wider bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-full">
                ຕັ້ງລະຫັດຜ່ານໃໝ່
              </div>
              <div className="flex-grow border-t border-dashed border-gray-300"></div>
            </div>

            {/* ── 3. ສ່ວນຂອງລະຫັດໃໝ່ ── */}
            <div className="bg-[#1275e2]/[0.03] p-3 rounded-xl border border-[#1275e2]/10 space-y-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="new_password_h" className="text-xs font-bold text-[#0a468c] ml-1">
                  ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new_password_h"
                  type="password"
                  placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-10 rounded-xl border-[#1275e2]/20 bg-white focus-visible:border-[#1275e2] focus-visible:ring-1 focus-visible:ring-[#1275e2] transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="confirm_password_h" className="text-xs font-bold text-[#0a468c] ml-1">
                  ຢືນຢັນລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password_h"
                  type="password"
                  placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-10 rounded-xl border-[#1275e2]/20 bg-white focus-visible:border-[#1275e2] focus-visible:ring-1 focus-visible:ring-[#1275e2] transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </form>

          <DialogFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-2 pt-3 border-t border-gray-50">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsChangePwdOpen(false)}
              disabled={isSubmittingPwd}
              className="w-full sm:w-1/2 h-10 bg-white border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700 font-extrabold text-sm rounded-xl transition-all shadow-sm"
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              form="header-change-pwd-form"
              disabled={isSubmittingPwd || !oldPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-1/2 h-10 bg-[#1275e2] border-2 border-[#1275e2] hover:border-[#0f62c0] hover:bg-[#0f62c0] text-white font-extrabold text-sm rounded-xl transition-all shadow-sm relative overflow-hidden"
            >
              {isSubmittingPwd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <span>ບັນທຶກລະຫັດຜ່ານ</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}