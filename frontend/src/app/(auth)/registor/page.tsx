"use client"
import { AuthLayout } from '@/components/auth/authLayout';
import { RegisterForm } from '@/components/auth/registerForm';
import React from 'react';


export default function RegisterPage() {
  return (
    <AuthLayout 
      title="ສ້າງບັນຊີໃໝ່" 
      subtitle="ລົງທະບຽນເພື່ອເລີ່ມຕົ້ນການນຳໃຊ້ລະບົບ"
    >
      <RegisterForm />
    </AuthLayout>
  );
}