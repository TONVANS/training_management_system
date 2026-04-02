// src/components/auth/AuthProxy.tsx
"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth/authStore';

export default function AuthProxy({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, token, isHydrated } = useAuthStore();

    useEffect(() => {
        if (!isHydrated) return;

        const publicPaths = ['/login', '/register', '/forgot-password'];
        const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

        const employeeAllowedPaths = ['/employee_dashboard', '/catalog', '/my-learning', '/profile'];
        const isEmployeeAllowedPath = employeeAllowedPaths.some(path => pathname?.startsWith(path));

        if (!token && !isPublicPath) {
            router.push('/login');
        } else if (token) {
            if (user?.role === 'EMPLOYEE') {
                // If it's a public path or not an allowed employee path, redirect to dashboard
                if (isPublicPath || !isEmployeeAllowedPath) {
                    router.push('/employee_dashboard');
                }
            } else {
                // For ADMIN or other roles, just redirect away from public paths
                if (isPublicPath) {
                    router.push('/dashboard');
                }
            }
        }
    }, [isHydrated, token, user, pathname, router]);

    // ใช้ isHydrated แทน isReady โดยตรง
    if (!isHydrated) {
        return null;
    }

    return <>{children}</>;
}