// src/app/(site)/layout.tsx
import DashboardShell from "@/layout/dashboardShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}