// frontend/src/app/(client_site)/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { Phone, Mail, Building, Briefcase, LogOut, User, IdCardLanyard, ShieldCheck, Lock, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";
import { toast } from "sonner"; // 📌 ໃຊ້ sonner ສຳລັບແຈ້ງເຕືອນ

// 📌 Import UI Components ຂອງ Shadcn
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { profile, isLoading, fetchProfile } = useEmployeeStore();
  // 📌 ດຶງ changePassword ອອກມາຈາກ Store
  const { user, logout, changePassword } = useAuthStore();
  const router = useRouter();

  // 📌 State ສຳລັບປ່ຽນລະຫັດຜ່ານ
  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 📌 ຟັງຊັນສຳລັບ Submit ປ່ຽນລະຫັດຜ່ານ
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // ກວດສອບຄວາມຖືກຕ້ອງເບື້ອງຕົ້ນ
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }

    setIsSubmittingPwd(true);
    try {
      const result = await changePassword(oldPassword, newPassword);
      toast.success(result?.message || "ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!");

      // ປິດ Dialog ແລະ ລ້າງຄ່າໃນ Form
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

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນໂປຣໄຟລ໌...</span>
      </div>
    );
  }

  if (!profile) return null;

  const contactItems = [
    { icon: Mail, value: profile.email || "ບໍ່ມີອີເມວ", label: "ອີເມວ (Email)" },
    { icon: Phone, value: profile.phone || "ບໍ່ມີເບີໂທລະສັບ", label: "ເບີໂທ (Phone)" },
  ];

  const orgItems = [
    { icon: Building, label: "ກົມ (Department)", value: profile.department?.name },
    { icon: Building, label: "ພະແນກ (Division)", value: profile.division?.name },
    { icon: Building, label: "ໜ່ວຍງານ (Unit)", value: profile.unit?.name },
    { icon: Briefcase, label: "ຕຳແໜ່ງ (Position)", value: profile.position?.name },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden relative">
        <div className="h-40 bg-gradient-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 20%, white 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        </div>

        <div className="px-6 md:px-10 pb-8 relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-b from-[#4fa3f7] to-[#1275e2] flex items-center justify-center shadow-lg -mt-14 shrink-0 relative">
            <User size={50} className="text-white" strokeWidth={2.5} />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Active">
              <ShieldCheck size={14} className="text-white" />
            </div>
          </div>

          <div className="min-w-0 text-center sm:text-left flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight truncate">
              {profile.first_name_la} {profile.last_name_la}
            </h1>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#0a468c] bg-blue-50 px-3.5 py-1.5 rounded-lg font-bold border border-blue-100/50">
                <IdCardLanyard size={14} /> ລະຫັດພະນັກງານ: {profile.employee_code}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* Contact Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
              <Phone size={20} />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">ຂໍ້ມູນຕິດຕໍ່</h2>
          </div>

          <div className="space-y-4 flex-1">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="group p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-white hover:border-[#1275e2]/20 hover:shadow-sm transition-all flex items-center gap-4">
                <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={18} className="text-[#1275e2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Org Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Building size={20} />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">ຂໍ້ມູນອົງກອນ</h2>
          </div>

          <div className="space-y-4 flex-1">
            {orgItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="group p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-white hover:border-emerald-200/50 hover:shadow-sm transition-all flex items-start gap-4">
                <div className="mt-0.5 w-8 h-8 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug mt-1">
                    {value || <span className="text-gray-400 font-medium">ບໍ່ມີຂໍ້ມູນ</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">

        {/* 📌 ປຸ່ມປ່ຽນລະຫັດຜ່ານ */}
        <button
          onClick={() => setIsChangePwdOpen(true)}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700 font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-sm group"
        >
          <Lock size={18} className="group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
          ປ່ຽນລະຫັດຜ່ານ
        </button>

        {/* ປຸ່ມອອກຈາກລະບົບ */}
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-white border-2 border-red-100 hover:border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          ອອກຈາກລະບົບ
        </button>

      </div>

      {/* ── 📌 Change Password Dialog (Compact Version) ── */}
      <Dialog open={isChangePwdOpen} onOpenChange={setIsChangePwdOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl md:rounded-[2rem] p-5 sm:p-6 overflow-hidden border-0 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">

          <DialogHeader className="flex flex-col items-center text-center pb-0">
            {/* ຫຼຸດຂະໜາດໄອຄອນລົງ */}
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

          {/* ຫຼຸດ gap ໃຫ້ຊິດກັນຂຶ້ນ */}
          <form id="change-pwd-form" onSubmit={handleChangePassword} className="grid gap-2 py-2">

            {/* ── 1. ສ່ວນຂອງລະຫັດເກົ່າ ── */}
            <div className="space-y-1.5 text-left px-1">
              <Label htmlFor="old_password" className="text-xs font-bold text-gray-700 ml-1">
                ລະຫັດຜ່ານເກົ່າ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="old_password"
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
                <Label htmlFor="new_password" className="text-xs font-bold text-[#0a468c] ml-1">
                  ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new_password"
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
                <Label htmlFor="confirm_password" className="text-xs font-bold text-[#0a468c] ml-1">
                  ຢືນຢັນລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
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

          {/* ຫຼຸດຄວາມສູງປຸ່ມລົງເຫຼືອ h-10 */}
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
              form="change-pwd-form"
              disabled={isSubmittingPwd || !oldPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-1/2 h-10 bg-[#1275e2] border-2 border-[#1275e2] hover:border-[#0f62c0] hover:bg-[#0f62c0] text-white font-extrabold text-sm rounded-xl transition-all shadow-sm relative overflow-hidden"
            >
              {isSubmittingPwd ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              <span>ບັນທຶກລະຫັດຜ່ານ</span>
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}