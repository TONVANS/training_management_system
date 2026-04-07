// src/app/(site)/participant_lists/[id]/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Award, Search, Download, CheckCircle2, XCircle, Clock3,
  Circle, User, Briefcase, UploadCloud, MapPin, MonitorPlay,
  BookOpen
} from "lucide-react";

import { useParticipantListStore } from "@/store/participantListStore";
import { EnrolledCourseDetail } from "@/types/participant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- Helper Functions ---
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'COMPLETED': return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200";
    case 'FAILED': return "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200";
    case 'IN_PROGRESS': return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200";
    case 'ENROLLED': return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200";
    default: return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
  }
};

const getStatusLaoText = (status: string) => {
  switch (status) {
    case 'COMPLETED': return "ສຳເລັດ";
    case 'FAILED': return "ບໍ່ຜ່ານ";
    case 'IN_PROGRESS': return "ກຳລັງຮຽນ";
    case 'ENROLLED': return "ລົງທະບຽນແລ້ວ";
    default: return status;
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircle2 size={14} className="mr-1" />;
    case 'FAILED': return <XCircle size={14} className="mr-1" />;
    case 'IN_PROGRESS': return <Clock3 size={14} className="mr-1" />;
    default: return <Circle size={14} className="mr-1" />;
  }
};

export default function ParticipantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeCode = params?.id as string; // Route parameter acts as employee_code

  // Store
  const { selectedEmployeeHistory, isLoading, fetchEmployeeHistory } = useParticipantListStore();

  // Local States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnrolledCourseDetail | null>(null);

  // Fetch data on mount
  useEffect(() => {
    if (employeeCode) {
      fetchEmployeeHistory(Number(employeeCode));
    }
  }, [employeeCode, fetchEmployeeHistory]);

  const employee = selectedEmployeeHistory?.employee;
  // ໃຊ້ useMemo ເພື່ອບໍ່ໃຫ້ມັນສ້າງ Array ໃໝ່ທຸກຄັ້ງທີ່ Render
  const courses = useMemo(() => selectedEmployeeHistory?.courses || [], [selectedEmployeeHistory?.courses]);

  // Filter Logic
  const filteredHistory = useMemo(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter((c) => c.enrollment_status === filterStatus);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [courses, searchTerm, filterStatus, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນປະຫວັດ...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="text-gray-400" size={40} />
        </div>
        <h2 className="text-xl font-bold">ບໍ່ພົບຂໍ້ມູນພະນັກງານ</h2>
        <Button onClick={() => router.push('/participant_lists')}>ກັບໄປໜ້າລາຍການ</Button>
      </div>
    );
  }

  const stats = {
    total: employee.total_courses,
    passed: courses.filter(c => c.enrollment_status === 'COMPLETED').length,
    inProgress: courses.filter(c => c.enrollment_status === 'IN_PROGRESS').length,
  };

  const handleOpenUpload = (item: EnrolledCourseDetail) => {
    setSelectedItem(item);
    setIsUploadOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      {/* Top Nav */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 h-16 flex items-center shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push('/participant_lists')} className="mr-2 hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Button>
        <span className="font-medium text-gray-400 text-sm">Users / </span>
        <span className="font-semibold ml-2 text-gray-800">{employee.full_name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Profile Header Card */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-900" />
          <CardContent className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 items-start">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-2xl bg-white">
                <AvatarFallback className="rounded-2xl text-4xl bg-blue-50 text-blue-600 font-bold">
                  {employee.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 pt-2 md:pt-14 w-full space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-gray-600 mt-2 text-sm">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {employee.employee_code}
                      </Badge>
                      <Briefcase size={16} /> {employee.position}
                      <span className="mx-1 text-gray-300">•</span>
                      <Building2 size={16} /> {employee.department}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-gray-300"><Mail size={16} /> Email</Button>
                    <Button variant="outline" className="gap-2 border-gray-300"><Phone size={16} /> Call</Button>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Email</span>
                    <p className="font-medium text-gray-800 truncate">{employee.email || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Division</span>
                    <p className="font-medium text-gray-800">{employee.division || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Unit</span>
                    <p className="font-medium text-gray-800">{employee.unit || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Total Assigned</span>
                    <p className="font-medium text-gray-800">{stats.total} Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBox icon={<Award />} label="ຫຼັກສູດທັງໝົດ" value={stats.total} sub="ທີ່ລົງທະບຽນ" color="text-blue-600 bg-blue-50" />
          <StatBox icon={<Clock3 />} label="ກຳລັງຮຽນ" value={stats.inProgress} sub="ຫຼັກສູດທີ່ກຳລັງດຳເນີນ" color="text-amber-600 bg-amber-50" />
          <StatBox icon={<CheckCircle2 />} label="ສຳເລັດແລ້ວ" value={stats.passed} sub={`${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% ຂອງທັງໝົດ`} color="text-emerald-600 bg-emerald-50" />
        </div>

        {/* Data Table Section */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                  <BookOpen className="text-blue-500" size={24} /> ລາຍການຫຼັກສູດທີ່ລົງທະບຽນ
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">ປະຫວັດການອົບຮົມ ແລະ ສະຖານະການຮຽນຂອງພະນັກງານ</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2"><Download size={16} /> ລາຍງານ PDF</Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="ຄົ້ນຫາຊື່ຫຼັກສູດ, ໝວດໝູ່..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Tabs defaultValue="All" onValueChange={setFilterStatus}>
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="All">ທັງໝົດ</TabsTrigger>
                    <TabsTrigger value="COMPLETED">ສຳເລັດ</TabsTrigger>
                    <TabsTrigger value="IN_PROGRESS">ກຳລັງຮຽນ</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                  <SelectTrigger className="w-36 bg-white">
                    <SelectValue placeholder="ຈັດລຽງຕາມ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">ວັນທີ</SelectItem>
                    <SelectItem value="title">ຊື່ຫຼັກສູດ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 sm:px-5 py-2">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="w-[40%] text-gray-600">ຂໍ້ມູນຫຼັກສູດ</TableHead>
                  <TableHead className="text-gray-600">ວັນທີ & ຮູບແບບ</TableHead>
                  <TableHead className="text-center text-gray-600">ສະຖານະ</TableHead>
                  <TableHead className="text-center w-36 text-gray-600">ໃບຢັ້ງຢືນ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <TableRow key={item.enrollment_id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell className="align-top py-4">
                        <div className="font-semibold text-gray-900 line-clamp-2">{item.title}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50/50 border-blue-100">
                            {item.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1.5 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {item.format === 'ONLINE' ? <MonitorPlay size={14} className="text-blue-400" /> : <MapPin size={14} className="text-emerald-500" />}
                          ຮູບແບບ: {item.format}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle text-center py-4">
                        <Badge variant="outline" className={`${getStatusBadgeVariant(item.enrollment_status)} font-medium whitespace-nowrap px-2.5 py-0.5`}>
                          {getStatusIcon(item.enrollment_status)}
                          {getStatusLaoText(item.enrollment_status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="align-middle text-center py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full gap-2 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          onClick={() => handleOpenUpload(item)}
                        >
                          <UploadCloud size={16} />
                          <span className="hidden sm:inline">ອັບໂຫລດ</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-gray-300" />
                        <p>ບໍ່ພົບຂໍ້ມູນຫຼັກສູດທີ່ກົງກັບເງື່ອນໄຂ</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog Component */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">ອັບໂຫລດໃບຢັ້ງຢືນ</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              ຫຼັກສູດ: <span className="font-semibold text-gray-800">{selectedItem?.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="file" className="font-medium">ເລືອກຟາຍເອກະສານ</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 group">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">ຄລິກເພື່ອອັບໂຫລດ ຫຼື ລາກຟາຍມາວາງ</p>
                <p className="text-xs text-gray-400 mt-1">ຮອງຮັບ PDF, PNG, JPG ຂະໜາດບໍ່ເກີນ 10MB</p>
                <Input id="file" type="file" className="hidden" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-medium">ໝາຍເຫດ (ທາງເລືອກ)</Label>
              <Input id="desc" placeholder="ເພີ່ມລາຍລະອຽດເພີ່ມເຕີມເຊັ່ນ: ເລກທີໃບປະກາດ..." className="bg-gray-50" />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsUploadOpen(false)} className="hover:bg-gray-100">ຍົກເລີກ</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
              <UploadCloud size={16} /> ບັນທຶກເອກະສານ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// --- Simplified Helper Component ---
function StatBox({ icon, label, value, sub, color }: { icon: React.ReactNode, label: string, value: string | number, sub: string, color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow border-gray-100">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h4 className="text-3xl font-black mt-1.5 text-gray-800">{value}</h4>
          <span className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium">{sub}</span>
        </div>
        <div className={`p-3 rounded-2xl ${color} shadow-sm`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<Record<string, unknown>>, { size: 24 }) : icon}
        </div>
      </CardContent>
    </Card>
  );
}