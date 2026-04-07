// frontend/src/components/auth/authLayout.tsx
import React from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden bg-[#0f62c0] flex-col justify-between p-10 xl:p-16 text-white">
        
        {/* Modern Background Pattern with Mesh Gradients */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1275e2] to-[#0a468c]">
           {/* Abstract Gradients */}
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/10 blur-[100px] mix-blend-overlay"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#ffb13b]/20 blur-[100px]"></div>
           
           {/* Grid Pattern Overlay (Soft) */}
           <div className="absolute inset-0 opacity-[0.05]" 
                style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
           </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-between max-w-xl mx-auto w-full">
            {/* Logo Section */}
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2.5 border-2 border-white/20">
                <Image 
                  src="/images/logo/logo.png" 
                  alt="Lao Training Sys Logo" 
                  width={64} 
                  height={64} 
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Lao Training Sys</h1>
                <p className="text-sm font-medium text-blue-100/80 uppercase tracking-widest mt-0.5">ລະບົບຈັດການການຝຶກອົບຮົມ</p>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
              <h2 className="text-4xl xl:text-5xl font-bold leading-[1.3] text-white">
                ພັດທະນາ<span className="text-[#0a468c] bg-white px-3 py-1.5 rounded-xl mx-2 inline-block shadow-lg -rotate-1 hover:rotate-0 transition-transform cursor-default">ສັກກະຍະພາບ</span><br/>
                ສູ່ຄວາມເປັນ<span className="text-[#ffb13b]">ມືອາຊີບ</span>
              </h2>
              <p className="text-base xl:text-lg text-blue-50 leading-relaxed font-light max-w-md opacity-90">
                ລະບົບການຈັດການການຝຶກອົບຮົມທີ່ທັນສະໄໝ ຍົກລະດັບບຸກຄະລາກອນ ແລະ ຊ່ວຍໃຫ້ອົງກອນຂອງທ່ານເຕີບໃຫຍ່ຢ່າງມີປະສິດທິພາບ.
              </p>
              
              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3 pt-6">
                {['ສະດວກ', 'ທັນສະໄໝ', 'ປອດໄພ', 'ວ່ອງໄວ'].map((tag, idx) => (
                    <span 
                      key={tag} 
                      className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        ✓ {tag}
                    </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end text-xs xl:text-sm text-blue-100/60 font-medium border-t border-white/10 pt-6">
              <p>&copy; {new Date().getFullYear()} Training & Development System.</p>
              <p className="px-2 py-1 bg-white/10 rounded-md backdrop-blur-sm">v2.0.0</p>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-[45%] xl:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Decorative background element for right side */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-50/50 blur-[80px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
           {/* Mobile Logo (Visible only on small screens) */}
           <div className="lg:hidden flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/10 p-3 border border-gray-100">
                <Image 
                  src="/images/logo/logo.png" 
                  alt="Lao Training Sys Logo" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                  priority
                />
              </div>
           </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-gray-500">
              {subtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
            {children}
          </div>
          
          {/* Bottom spacing for mobile */}
          <div className="h-8 lg:hidden"></div>
        </div>
      </div>
    </div>
  );
}