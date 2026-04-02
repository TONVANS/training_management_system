// frontend/src/components/auth/registerForm.tsx
import React from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullname" className="text-sm font-medium text-gray-700 block">
          ຊື່ ແລະ ນາມສະກຸນ
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <User size={18} />
          </div>
          <input
            id="fullname"
            type="text"
            required
            placeholder="ສົມຊາຍ ໃຈດີ"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all sm:text-sm"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="reg-email" className="text-sm font-medium text-gray-700 block">
          ອີເມວ (Email)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Mail size={18} />
          </div>
          <input
            id="reg-email"
            type="email"
            required
            placeholder="name@company.com"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all sm:text-sm"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="reg-password" className="text-sm font-medium text-gray-700 block">
          ລະຫັດຜ່ານ
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock size={18} />
          </div>
          <input
            id="reg-password"
            type="password"
            required
            placeholder="••••••••"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all sm:text-sm"
          />
        </div>
      </div>

       {/* Confirm Password Field */}
       <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 block">
          ຢືນຢັນລະຫັດຜ່ານ
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock size={18} />
          </div>
          <input
            id="confirm-password"
            type="password"
            required
            placeholder="••••••••"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent transition-all sm:text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0B1F3A] hover:bg-[#163A66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B1F3A] disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            ກຳລັງສ້າງບັນຊີ...
          </>
        ) : (
          'ລົງທະບຽນ (Sign Up)'
        )}
      </button>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-500">
        ມີບັນຊີຢູ່ແລ້ວ?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          ເຂົ້າສູ່ລະບົບ
        </Link>
      </div>
    </form>
  );
}