// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: '/',           // ເມື່ອເຂົ້າ path ໜ້າທຳອິດ (root)
        destination: '/dashboard', // ໃຫ້ສົ່ງໄປທີ່ /dashboard
        permanent: true,       // ຈື່ຄ່າໄວ້ (ໃຊ້ false ຖ້າຍັງແກ້ບ່ອຍໆ)
      },
    ]
  },

  // ເພີ່ມ rewrites ເພື່ອເຮັດ Proxy ບັງ URL Backend
  async rewrites() {
    return [
      {
        // source: ຄື Path ທີ່ Frontend ຈະເອີ້ນໃຊ້ (ຕົວຢ່າງ Browser ຈະເຫັນແຕ່ /api/...)
        source: '/api/:path*', 
        
        // destination: ຄື URL ຂອງ Backend ຕົວຈິງ (NestJS ຂອງທ່ານ)
        // ໝາຍເຫດ: ໃຫ້ປ່ຽນ http://localhost:3400 ເປັນ URL ຫຼື Port Backend ຂອງທ່ານ
        // ຖ້າ Backend ຂອງທ່ານມີ /api ນຳກໍໃຫ້ໃສ່ເປັນ http://localhost:3400/api/:path*
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, 
      },
    ];
  },
};

export default nextConfig;