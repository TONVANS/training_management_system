// src/app/(auth)/login/page.tsx
"use client"
import { AuthLayout } from "@/components/auth/authLayout";
import { LoginForm } from "@/components/auth/loginForm";

export default function LoginPage() {
  return (
    <AuthLayout 
      title="ໜ້າຕ່າງເຂົ້າສູ່ລະບົບ" 
      subtitle="ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອຈັດການຂໍ້ມູນການຝຶກອົບຮົມ"
    >
      <LoginForm />
    </AuthLayout>
  );
}