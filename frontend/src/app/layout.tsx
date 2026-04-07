// src/app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google"; // ນຳເຂົ້າ Noto Sans Lao
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import AuthProxy from "@/components/auth/AuthProxy";

// ຕັ້ງຄ່າ Font Noto Sans Lao
const notoSanLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["400", "700"], // ທ່ານສາມາດເລືອກຄວາມໜາຂອງຟ້ອນໄດ້ຕາມຕ້ອງການ
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Training Management System",
  description: "Enterprise Training & Development Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo">
      <body className={notoSanLao.className}>
        <AuthProxy>
          {children}
        </AuthProxy>
        <Toaster />
      </body>
    </html>
  );
}