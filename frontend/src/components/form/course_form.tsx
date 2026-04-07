"use client";

import { useState } from "react";
import {
  Plus,
  MapPin,
  Users,
  UploadCloud,
  X,
  Search,
  Edit,
  FileText,
  Trash2,
  Menu
} from "lucide-react";

// --- Mock Shadcn UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// ✨ Import Pagination Components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// --- Mock Data ---
export interface Course {
  id: string;
  title: string;
  participants: number;
  startDate: string;
  endDate: string;
  category: string;
  location: string;
  institute: string;
  format: "Online" | "Onsite";
}

export const initialCourses: Course[] = [
  { id: "1", title: "ພື້ນຖານການເປັນຜູ້ນຳ (Leadership 101)", participants: 25, startDate: "21/01/2026", endDate: "23/01/2026", category: "Management", location: "ຫ້ອງປະຊຸມ A, ສໍານັກງານໃຫຍ່", institute: "Lao Leadership Academy", format: "Onsite" },
  { id: "2", title: "React & Next.js Advanced Pattern", participants: 12, startDate: "20/01/2026", endDate: "25/01/2026", category: "Technology", location: "Google Meet", institute: "Internal Tech Team", format: "Online" },
  { id: "3", title: "Cyber Security Awareness", participants: 30, startDate: "26/01/2026", endDate: "26/01/2026", category: "Technology", location: "Training Room B", institute: "CyberSafe Lao", format: "Onsite" },
  { id: "4", title: "Effective Communication", participants: 18, startDate: "28/01/2026", endDate: "29/01/2026", category: "Soft Skills", location: "Zoom", institute: "Global HR", format: "Online" },
  { id: "5", title: "Project Management PMP", participants: 10, startDate: "01/02/2026", endDate: "05/02/2026", category: "Management", location: "Novotel Vientiane", institute: "PM Institute", format: "Onsite" },
  { id: "6", title: "Data Analysis with Python", participants: 15, startDate: "10/02/2026", endDate: "15/02/2026", category: "Data Science", location: "Online", institute: "DataCamp", format: "Online" },
];

const mockEmployees: Record<string, string> = {
  "EMP001": "ສົມຊາຍ ໃຈດີ",
  "EMP002": "ວຽງໄຊ ມະນີ",
  "EMP003": "ນ້ອຍ ສຸວັນ",
  "EMP004": "ຄຳໃສ ແກ້ວມະນີ",
};

export function Test_Table() {
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Data States
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✨ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // ກຳນົດຈຳນວນແຖວຕໍ່ໜ້າ

  // Form States
  const [locationScope, setLocationScope] = useState<"domestic" | "international">("domestic");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [foundEmployeeName, setFoundEmployeeName] = useState<string | null>(null);
  const [addedParticipants, setAddedParticipants] = useState<{ id: string, name: string }[]>([]);

  // --- Logic Functions ---

  const handleSearchEmployee = (id: string) => {
    setEmployeeIdInput(id);
    if (mockEmployees[id]) {
      setFoundEmployeeName(mockEmployees[id]);
    } else {
      setFoundEmployeeName(null);
    }
  };

  const handleAddParticipant = () => {
    if (foundEmployeeName && employeeIdInput) {
      if (!addedParticipants.find(p => p.id === employeeIdInput)) {
        setAddedParticipants([...addedParticipants, { id: employeeIdInput, name: foundEmployeeName }]);
        setEmployeeIdInput("");
        setFoundEmployeeName(null);
      }
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setAddedParticipants(addedParticipants.filter(p => p.id !== id));
  };

  const handleViewFile = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("ບໍ່ມີເອກະສານແນບ");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      setCourses(courses.filter(c => c.id !== deletingId));
      setIsAlertOpen(false);
      setDeletingId(null);
      
      // ✨ ຖ້າລົບຂໍ້ມູນໜ້າສຸດທ້າຍໝົດ ໃຫ້ກັບມາໜ້າກ່ອນໜ້າ
      if (paginatedCourses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setAddedParticipants([]);
    setEmployeeIdInput("");
    setIsDialogOpen(true);
  }

  // ✨ Pagination Calculation Logic
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">ຈັດການຂໍ້ມູນການຝຶກອົບຮົມ</h2>
          <p className="text-sm text-gray-500">Courses Management</p>
        </div>

        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus size={18} /> ສ້າງຫຼັກສູດໃໝ່
        </Button>
      </div>

      {/* --- Main Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-linear-to-r from-gray-50 to-gray-100/50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-70 font-semibold text-gray-700">ຫົວຂໍ້ຝຶກອົບຮົມ</TableHead>
                <TableHead className="font-semibold text-gray-700">ໝວດໝູ່</TableHead>
                <TableHead className="font-semibold text-gray-700">ຜູ້ເຂົ້າຮ່ວມ</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-45">ວັນທີ (Start - End)</TableHead>
                <TableHead className="font-semibold text-gray-700">ສະຖານທີ່</TableHead>
                <TableHead className="font-semibold text-gray-700">ອົງກອນ</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">ຈັດການ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ✨ ໃຊ້ paginatedCourses ແທນ courses */}
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                <TableRow
                  key={course.id}
                  className="hover:bg-blue-50/30 transition-colors border-b border-gray-100"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900 leading-snug">
                        {course.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {course.format === 'Online' ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <span className="text-xs text-gray-500 font-medium">
                          {course.format}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className="bg-linear-to-r from-slate-50 to-gray-50 border-gray-200 text-gray-700 font-medium"
                    >
                      {course.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users size={14} className="text-blue-600" />
                      </div>
                      <span className="font-medium">{course.participants}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">{course.startDate}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{course.endDate}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-gray-600 max-w-50">
                      <MapPin size={14} className="shrink-0 text-gray-400" />
                      <span className="truncate text-sm">{course.location}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className="text-sm text-gray-700">{course.institute}</span>
                  </TableCell>

                  {/* --- Action Dropdown --- */}
                  <TableCell className="text-right py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 hover:bg-blue-100 rounded-lg"
                        >
                          <Menu  className="h-5 w-5 text-blue-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-50">
                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewFile(course.title)} className="cursor-pointer py-2.5">
                          <FileText className="mr-3 h-4 w-4 text-blue-500" />
                          <span className="font-medium">ເບິ່ງເອກະສານ</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(course)} className="cursor-pointer py-2.5">
                          <Edit className="mr-3 h-4 w-4 text-amber-500" />
                          <span className="font-medium">ແກ້ໄຂຂໍ້ມູນ</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(course.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5">
                          <Trash2 className="mr-3 h-4 w-4" />
                          <span className="font-medium">ລົບຂໍ້ມູນ</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    ບໍ່ພົບຂໍ້ມູນ
                  </TableCell>
               </TableRow>
            )}
            </TableBody>
          </Table>
        </div>

        {/* ✨ Pagination Footer */}
        {courses.length > itemsPerPage && (
          <div className="py-4 border-t border-gray-100 flex flex-col items-center gap-3 bg-white">
             <Pagination>
               <PaginationContent>
                 <PaginationItem>
                   <PaginationPrevious 
                     href="#" 
                     onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                     className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                   />
                 </PaginationItem>
                 
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                   <PaginationItem key={page}>
                     <PaginationLink 
                        href="#" 
                        isActive={currentPage === page}
                        onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                     >
                       {page}
                     </PaginationLink>
                   </PaginationItem>
                 ))}

                 <PaginationItem>
                   <PaginationNext 
                     href="#" 
                     onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                     className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                   />
                 </PaginationItem>
               </PaginationContent>
             </Pagination>
             <div className="text-xs text-gray-400">
                ສະແດງ {startIndex + 1} - {Math.min(endIndex, courses.length)} ຈາກ {courses.length} ລາຍການ
             </div>
          </div>
        )}
      </div>

        {/* --- Dialog Form (Create/Edit) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
        </DialogTrigger>

        <DialogContent className="sm:max-w-800px max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingId ? "ແກ້ໄຂຂໍ້ມູນການຝຶກອົບຮົມ" : "ເພີ່ມຂໍ້ມູນການຝຶກອົບຮົມ"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "ປັບປຸງຂໍ້ມູນຫຼັກສູດທີ່ມີຢູ່ແລ້ວ" : "ສ້າງຫຼັກສູດໃໝ່ເຂົ້າໃນລະບົບ"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* 1. ຂໍ້ມູນທົ່ວໄປ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                ຂໍ້ມູນທົ່ວໄປ
              </h3>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">
                    ຫົວຂໍ້ຝຶກອົບຮົມ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="ໃສ່ຊື່ຫຼັກສູດ..."
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      ໝວດໝູ່ <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="ເລືອກໝວດໝູ່" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">Technology (IT)</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="language">Languages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="format" className="text-sm font-medium">
                      ຮູບແບບ <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="ເລືອກຮູບແບບ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">On-site (ເຊິ່ງໜ້າ)</SelectItem>
                        <SelectItem value="online">Online (ອອນລາຍ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* 2. ວັນທີ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                ໄລຍະເວລາ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    ວັນທີເລີ່ມ <span className="text-red-500">*</span>
                  </Label>
                  <Input id="startDate" type="date" className="h-10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    ວັນທີສິ້ນສຸດ <span className="text-red-500">*</span>
                  </Label>
                  <Input id="endDate" type="date" className="h-10" />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* 3. ສະຖານທີ່ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                ສະຖານທີ່ຝຶກອົບຮົມ
              </h3>

              <div className="space-y-3">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      checked={locationScope === 'domestic'}
                      onChange={() => setLocationScope('domestic')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">ພາຍໃນປະເທດ</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      checked={locationScope === 'international'}
                      onChange={() => setLocationScope('international')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">ຕ່າງປະເທດ</span>
                  </label>
                </div>

                {locationScope === 'domestic' ? (
                  <Input
                    placeholder="ລະບຸຊື່ສະຖານທີ່ (ຕົວຢ່າງ: ຫ້ອງປະຊຸມ A, ໂຮງແຮມລາວພລາຊາ...)"
                    className="h-10"
                  />
                ) : (
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="ເລືອກປະເທດ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">Thailand</SelectItem>
                      <SelectItem value="vn">Vietnam</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="other">Other...</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <Separator className="my-2" />

            {/* 4. ຜູ້ເຂົ້າຮ່ວມ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded"></div>
                  ຜູ້ເຂົ້າຮ່ວມ
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {addedParticipants.length} ຄົນ
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end">
                  <div className="grid gap-2">
                    <Label htmlFor="empId" className="text-xs font-medium text-gray-600">
                      ລະຫັດພະນັກງານ
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="empId"
                        placeholder="EMP001..."
                        className="pl-9 h-10 bg-white"
                        value={employeeIdInput}
                        onChange={(e) => handleSearchEmployee(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-medium text-gray-600">
                      ຊື່-ນາມສະກຸນ
                    </Label>
                    <Input
                      readOnly
                      value={foundEmployeeName || ""}
                      placeholder="ລະບົບຈະສະແດງຊື່..."
                      className="bg-white h-10 text-gray-700"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddParticipant}
                    disabled={!foundEmployeeName}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    ເພີ່ມ
                  </Button>
                </div>

                {/* List of Added Participants */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <ScrollArea className="h-140px w-full pr-3">
                    {addedParticipants.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {addedParticipants.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between bg-linear-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 leading-tight text-sm">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {p.id}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveParticipant(p.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6">
                        <Users size={32} className="mb-3 opacity-40" />
                        <p className="text-sm font-medium">ຍັງບໍ່ມີຜູ້ເຂົ້າຮ່ວມ</p>
                        <p className="text-xs mt-1">ກະລຸນາເພີ່ມພະນັກງານເຂົ້າໃນລາຍການ</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* 5. ອັບໂຫລດເອກະສານ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded"></div>
                ເອກະສານແນບ
              </h3>

              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer text-center group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="pointer-events-none">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <p className="mt-3 text-sm text-gray-600 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOCX up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-10 px-6"
            >
              ຍົກເລີກ
            </Button>
            <Button className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {editingId ? "ບັນທຶກການແກ້ໄຂ" : "ສ້າງຫຼັກສູດ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Alert Dialog (Confirm Delete) --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ຢືນຢັນການລົບຂໍ້ມູນ?</AlertDialogTitle>
            <AlertDialogDescription>
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຫຼັກສູດນີ້?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              ຢືນຢັນການລົບ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}