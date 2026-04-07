// frontend/src/components/auth/loginForm.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth/authStore';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(employeeCode, password);
      const state = useAuthStore.getState();
      toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ!');

      if (state.user?.role === 'EMPLOYEE') {
        router.push('/employee_dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error("Login failed", err);
      const errorMessage =
        err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(errorMessage ?? 'ການເຂົ້າສູ່ລະບົບຜິດພາດ. ກະລຸນາກວດສອບລະຫັດພະນັກງານ ແລະ ລະຫັດຜ່ານ.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Code Field */}
      <div className="space-y-2">
        <label htmlFor="employee_code" className="text-sm font-semibold text-gray-700 block ml-1">
          ລະຫັດພະນັກງານ (Employee Code)
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1275e2] transition-colors">
            <User size={18} strokeWidth={2.5} />
          </div>
          <input
            id="employee_code"
            type="text"
            required
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="ເຊັ່ນ: EMP001"
            className="block w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1275e2] transition-all duration-200 text-sm sm:text-base font-medium"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700">
            ລະຫັດຜ່ານ (Password)
          </label>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1275e2] transition-colors">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full pl-11 pr-12 py-3 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1275e2] transition-all duration-200 text-sm sm:text-base font-medium tracking-wide"
          />
          {/* 📌 ປຸ່ມສະແດງ/ເຊື່ອງ ລະຫັດຜ່ານ */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#1275e2] focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center pt-1 ml-1">
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#1275e2] focus:ring-[#1275e2] border-gray-300 rounded cursor-pointer transition-colors"
            />
          </div>
          <div className="ml-2.5 text-sm">
            <label htmlFor="remember-me" className="font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors">
              ຈື່ຂ້ອຍໄວ້ໃນລະບົບ
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !employeeCode || !password}
        className="group w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_8px_20px_-6px_rgba(18,117,226,0.4)] text-base font-bold text-white bg-[#1275e2] hover:bg-[#0f62c0] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1275e2] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 mt-8"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            ກຳລັງເຂົ້າສູ່ລະບົບ...
          </>
        ) : (
          <>
            ເຂົ້າສູ່ລະບົບ
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}