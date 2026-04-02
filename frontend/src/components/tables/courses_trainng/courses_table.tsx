/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, MapPin, Edit, Trash2, Menu, Loader2, Eye,
  Search, Users, X, FilterX, FileText, Link as LinkIcon,
  GraduationCap, UserPlus, FolderOpen, AlertCircle,
  CheckCircle, UploadCloud, ChevronDown,
  Check, ChevronsUpDown // 📌 ເພີ່ມ Icon ສຳລັບ Combobox
} from "lucide-react";

import { cn } from "@/lib/utils"; // 📌 ຢ່າລືມ Import cn ມາໃຊ້
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
// 📌 Import Command ແລະ Popover ສຳລັບເຮັດ Searchable Select (Combobox)
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { useCourseStore } from "@/store/courseStore";
import { useCategoryStore } from "@/store/categoryStore";
import { TrainingFormat, LocationType, CourseStatus } from "@/types/common";
import { toast } from "sonner";
import { CourseResponse, CreateCourseRequest } from "@/types";
import { useRouter } from "next/navigation";
import api from "@/util/axios";

// ==========================================
// Types
// ==========================================
type CourseFormData = Partial<
  Pick<
    CourseResponse,
    | "title" | "description" | "category_id" | "start_date" | "end_date"
    | "format" | "location_type" | "location" | "country" | "budget"
    | "status" | "trainer" | "institution" | "organization"
  >
>;

type AddedParticipant = {
  id: number;
  enrollment_id?: number;
  name: string;
  code: string;
};

type MaterialItem =
  | { id: string; type: "FILE"; file: File; name: string }
  | { id: string; type: "URL"; url: string; name: string };

// ==========================================
// Status config helpers
// ==========================================
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [CourseStatus.ACTIVE]: { label: "ກຳລັງດຳເນີນ", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  [CourseStatus.SCHEDULED]: { label: "ລໍຖ້າເປີດສອນ", className: "bg-sky-50 text-sky-700 border-sky-200" },
  [CourseStatus.COMPLETED]: { label: "ສຳເລັດແລ້ວ", className: "bg-slate-100 text-slate-600 border-slate-200" },
  [CourseStatus.CANCELLED]: { label: "ຍົກເລີກ", className: "bg-red-50 text-red-600 border-red-200" },
};

// ==========================================
// Main Component
// ==========================================
export function Courses_Table() {
  const {
    courses, isLoading, total, page, limit,
    fetchCourses, createCourse, updateCourse, deleteCourse,
  } = useCourseStore();

  const { categories, fetchCategories } = useCategoryStore();
  const router = useRouter();

  // Dialog states
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // 📌 ຈັດການ State ເປີດ-ປິດ ຂອງ Combobox
  const [openFilterCategory, setOpenFilterCategory] = useState(false);
  const [openFormCategory, setOpenFormCategory] = useState(false);

  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [activeCourse, setActiveCourse] = useState<CourseResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterFormat, setFilterFormat] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Course form
  const defaultForm: CourseFormData = {
    title: "", description: "", category_id: 0,
    start_date: "", end_date: "",
    format: TrainingFormat.ONLINE,
    location_type: LocationType.DOMESTIC,
    location: "", country: "", budget: "0",
    status: CourseStatus.SCHEDULED,
    trainer: "", institution: "", organization: "",
  };
  const [formData, setFormData] = useState<CourseFormData>(defaultForm);

  // Participant states
  const [employeeIdSearch, setEmployeeIdSearch] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{ id: number; name: string; code: string } | null>(null);
  const [addedParticipants, setAddedParticipants] = useState<AddedParticipant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Material states
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ==========================================
  // Data loading & Debounce logic
  // ==========================================
  const loadData = useCallback((targetPage: number) => {
    fetchCourses({
      page: targetPage,
      limit: 10,
      title: filterTitle || undefined,
      category_id: filterCategory !== "ALL" ? Number(filterCategory) : undefined,
      format: filterFormat !== "ALL" ? (filterFormat as TrainingFormat) : undefined,
      status: filterStatus !== "ALL" ? (filterStatus as CourseStatus) : undefined,
      start_date_from: filterDateFrom ? `${filterDateFrom}T00:00:00Z` : undefined,
      start_date_to: filterDateTo ? `${filterDateTo}T23:59:59Z` : undefined,
    });
  }, [fetchCourses, filterTitle, filterCategory, filterFormat, filterStatus, filterDateFrom, filterDateTo]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filterTitle, filterCategory, filterFormat, filterStatus, filterDateFrom, filterDateTo, loadData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilter =
    filterTitle || filterCategory !== "ALL" || filterFormat !== "ALL" || filterStatus !== "ALL" ||
    filterDateFrom || filterDateTo;

  const handleClearFilter = () => {
    setFilterTitle(""); setFilterCategory("ALL"); setFilterFormat("ALL"); setFilterStatus("ALL");
    setFilterDateFrom(""); setFilterDateTo("");
  };

  const handleFormChange = (field: keyof CourseFormData, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ==========================================
  // 1. Course handlers
  // ==========================================
  const handleCreateNewCourse = () => {
    setEditingCourse(null);
    setFormData(defaultForm);
    setIsCourseDialogOpen(true);
  };

  const handleEditCourse = (course: CourseResponse) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description ?? "",
      category_id: course.category_id,
      start_date: course.start_date,
      end_date: course.end_date,
      format: course.format,
      location_type: course.location_type ?? LocationType.DOMESTIC,
      location: course.location ?? "",
      country: course.country ?? "",
      budget: course.budget,
      status: course.status,
      trainer: course.trainer ?? "",
      institution: course.institution ?? "",
      organization: course.organization ?? "",
    });
    setIsCourseDialogOpen(true);
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id || !formData.start_date || !formData.end_date) {
      toast.error("ກະລຸນາໃສ່ຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ");
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData: CreateCourseRequest = {
        title: formData.title!,
        description: formData.description ?? "",
        category_id: formData.category_id!,
        start_date: formData.start_date!,
        end_date: formData.end_date!,
        format: formData.format ?? TrainingFormat.ONLINE,
        budget: formData.budget ? String(formData.budget).replace(/,/g, "") : "0",
        status: formData.status ?? CourseStatus.SCHEDULED,
        trainer: formData.trainer ?? "",
        institution: formData.institution ?? "",
        organization: formData.organization ?? "",
      };
      if (formData.format === TrainingFormat.ONSITE) {
        submitData.location_type = formData.location_type ?? LocationType.DOMESTIC;
        if (formData.location_type === LocationType.DOMESTIC) {
          submitData.location = formData.location ?? "";
        } else {
          submitData.country = formData.country ?? "";
        }
      } else {
        submitData.location = formData.location ?? "";
      }
      editingCourse
        ? await updateCourse(editingCourse.id, submitData)
        : await createCourse(submitData);
      setIsCourseDialogOpen(false);
      loadData(page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Participant & Material handlers ເໝືອນເດີມ)
  const handleManageParticipants = async (course: CourseResponse) => {
    setActiveCourse(course);
    setEmployeeIdSearch(""); setFoundEmployee(null);
    setSearchError(null); setAddedParticipants([]);
    setIsParticipantDialogOpen(true);
    setIsLoadingParticipants(true);
    try {
      const res = await api.get('/enrollments', { params: { course_id: course.id } });
      const enrollments = res.data?.data || res.data || [];
      setAddedParticipants(enrollments.map((e: any) => ({
        id: e.employee_id, enrollment_id: e.id,
        name: e.employee ? `${e.employee.first_name_la} ${e.employee.last_name_la}` : "N/A",
        code: e.employee?.employee_code || "N/A",
      })));
      setActiveCourse(prev => prev ? { ...prev, enrollments } : prev);
    } catch { toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ເຂົ້າຮ່ວມໄດ້"); }
    finally { setIsLoadingParticipants(false); }
  };

  const handleSearchEmployee = async (code: string) => {
    setEmployeeIdSearch(code); setSearchError(null);
    if (!code || code.length < 4) { setFoundEmployee(null); return; }
    setIsSearching(true);
    try {
      const res = await api.get(`/employees/code/${code.trim()}`);
      const data = res.data?.data || res.data;
      if (data) setFoundEmployee({ id: data.id, name: `${data.first_name_la} ${data.last_name_la}`, code: data.employee_code || code.trim() });
    } catch (err: any) {
      setFoundEmployee(null);
      if (err?.response?.status === 404) setSearchError("ບໍ່ພົບຂໍ້ມູນພະນັກງານລະຫັດນີ້");
    } finally { setIsSearching(false); }
  };

  const handleAddParticipant = () => {
    if (!foundEmployee) return;
    if (addedParticipants.find(p => p.id === foundEmployee.id)) {
      toast.error("ພະນັກງານນີ້ຖືກເພີ່ມເຂົ້າໃນລາຍການແລ້ວ"); return;
    }
    setAddedParticipants(prev => [...prev, { id: foundEmployee.id, name: foundEmployee.name, code: foundEmployee.code }]);
    setEmployeeIdSearch(""); setFoundEmployee(null); setSearchError(null);
  };

  const handleSubmitParticipants = async () => {
    if (!activeCourse) return;
    setIsSubmitting(true);
    try {
      const original = activeCourse.enrollments || [];
      const origIds = original.map(e => e.employee_id);
      const currIds = addedParticipants.map(p => p.id);
      const toAdd = addedParticipants.filter(p => !origIds.includes(p.id));
      const toDel = original.filter(e => !currIds.includes(e.employee_id));
      if (toAdd.length > 0)
        await api.post('/enrollments/bulk', { employee_ids: toAdd.map(p => p.id), course_id: activeCourse.id });
      if (toDel.length > 0)
        await Promise.all(toDel.map(e => api.delete(`/enrollments/${e.id}`)));
      toast.success("ອັບເດດຜູ້ເຂົ້າຮ່ວມສຳເລັດ");
      setIsParticipantDialogOpen(false);
      loadData(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      toast.error(msg.includes("already enrolled") || err?.response?.status === 409
        ? "ມີພະນັກງານບາງຄົນລົງທະບຽນໃນຫຼັກສູດນີ້ແລ້ວ" : msg);
    } finally { setIsSubmitting(false); }
  };

  const handleManageMaterials = async (course: CourseResponse) => {
    setActiveCourse(course);
    setMaterialItems([]); setUrlInput("");
    setIsMaterialDialogOpen(true);
    setIsLoadingMaterials(true);
    try {
      const res = await api.get(`/training/courses/${course.id}/materials`);
      const mats = res.data?.data || res.data || [];
      setActiveCourse(prev => prev ? { ...prev, materials: mats } : prev);
    } catch (e) { console.log("Could not load existing materials", e); }
    finally { setIsLoadingMaterials(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      type: "FILE" as const, file: f, name: f.name,
    }));
    setMaterialItems(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      toast.error("ກະລຸນາໃສ່ລິ້ງ URL ກ່ອນເພີ່ມ");
      return;
    }
    let formattedUrl = urlInput.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    setMaterialItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type: "URL" as const, url: formattedUrl, name: formattedUrl,
    }]);
    setUrlInput("");
  };

  const handleSubmitMaterials = async () => {
    if (!activeCourse || materialItems.length === 0) {
      toast.error("ກະລຸນາເພີ່ມເອກະສານ ຫຼື ລິ້ງກ່ອນບັນທຶກ");
      return;
    }
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      const urlList: { type: string; file_path_or_link: string }[] = [];

      materialItems.forEach((item) => {
        if (item.type === "FILE") {
          fd.append("files", item.file);
        } else {
          urlList.push({
            type: "URL",
            file_path_or_link: item.url,
          });
        }
      });

      if (urlList.length > 0) {
        fd.append("urls_json", JSON.stringify(urlList));
      }

      await api.post(`/training/courses/${activeCourse.id}/materials`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("ເພີ່ມເອກະສານສຳເລັດແລ້ວ");
      setIsMaterialDialogOpen(false);
      loadData(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມເອກະສານ";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => { setDeletingId(id); setIsAlertOpen(true); };
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCourse(deletingId);
      setIsAlertOpen(false); setDeletingId(null);
      loadData(courses.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) { console.error(err); }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("la-LA", { year: "numeric", month: "2-digit", day: "2-digit" }) : "N/A";

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
                      bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">ຈັດການຂໍ້ມູນການຝຶກອົບຮົມ</h2>
          <p className="text-sm text-gray-400 mt-0.5">Courses Management</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(v => !v)}
            className={`gap-2 h-9 text-sm transition-colors ${showFilters || hasActiveFilter
              ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
              : "text-gray-600"
              }`}
          >
            <FilterX size={15} className={hasActiveFilter ? "text-blue-600" : ""} />
            ຕົວກອງ
            {hasActiveFilter && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center
                               rounded-full bg-blue-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
            <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>

          <Button
            onClick={handleCreateNewCourse}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm shadow-sm"
          >
            <Plus size={16} /> ສ້າງຫຼັກສູດໃໝ່
          </Button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 
                        animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">ກັ່ນຕົວເລືອກຂໍ້ມູນ</h3>
            {hasActiveFilter && (
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <X size={16} />
                ລຶບຕົວກັ່ນ
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ຫົວຂໍ້ຫຼັກສູດ
              </label>
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ຫຼັກສູດ..."
                value={filterTitle}
                onChange={e => setFilterTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
              />
            </div>

            {/* 📌 Category Dynamic Filter (Combobox) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ໝວດໝູ່
              </label>
              <Popover open={openFilterCategory} onOpenChange={setOpenFilterCategory}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFilterCategory}
                    className="w-full justify-between border-gray-300 rounded-lg h-10 text-sm bg-white font-normal hover:bg-white"
                  >
                    <span className="truncate">
                      {filterCategory !== "ALL"
                        ? categories.find((cat) => String(cat.id) === filterCategory)?.name
                        : "ທັງໝົດ"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent style={{ width: "var(--radix-popover-trigger-width)" }} className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ຄົ້ນຫາໝວດໝູ່..." />
                    <CommandList>
                      <CommandEmpty>ບໍ່ພົບໝວດໝູ່ທີ່ຄົ້ນຫາ.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="ALL"
                          onSelect={() => {
                            setFilterCategory("ALL");
                            setOpenFilterCategory(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filterCategory === "ALL" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          ທັງໝົດ
                        </CommandItem>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name} // ໃຊ້ຊື່ເປັນ value ສຳລັບໃຫ້ Command ຄົ້ນຫາ
                            onSelect={() => {
                              setFilterCategory(String(cat.id));
                              setOpenFilterCategory(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filterCategory === String(cat.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ຮູບແບບການຮຽນ
              </label>
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="w-full border border-gray-300 rounded-lg h-10 text-sm bg-white focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="ທັງໝົດ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ທັງໝົດ</SelectItem>
                  <SelectItem value={TrainingFormat.ONLINE}>🌐 Online</SelectItem>
                  <SelectItem value={TrainingFormat.ONSITE}>🏢 On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ສະຖານະ
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full border border-gray-300 rounded-lg h-10 text-sm bg-white focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="ທັງໝົດ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ທັງໝົດ</SelectItem>
                  <SelectItem value={CourseStatus.SCHEDULED}>⏳ ລໍຖ້າເປີດສອນ</SelectItem>
                  <SelectItem value={CourseStatus.ACTIVE}>✅ ກຳລັງດຳເນີນການ</SelectItem>
                  <SelectItem value={CourseStatus.COMPLETED}>🎓 ສຳເລັດແລ້ວ</SelectItem>
                  <SelectItem value={CourseStatus.CANCELLED}>❌ ຍົກເລີກ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ວັນທີ່ເລີ່ມຕົ້ນ
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
              />
            </div>

            {/* Date End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ວັນທີ່ສິ້ນສຸດ
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
              />
            </div>
          </div>

          {/* Result Count */}
          <div className="mt-5 text-sm text-gray-500 flex items-center pt-2">
            {isLoading ? (
              <span className="flex items-center gap-2 text-blue-500"><Loader2 size={14} className="animate-spin" /> ກຳລັງຄົ້ນຫາ...</span>
            ) : (
              <span>ພົບທັງໝົດ <strong className="text-gray-900">{total}</strong> ລາຍການ</span>
            )}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {!showFilters && hasActiveFilter && (
        <div className="flex flex-wrap gap-2 px-1">
          {filterTitle && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 flex items-center gap-1.5 rounded-md font-medium border border-blue-100">
              <span className="text-gray-500">ຊື່:</span> {filterTitle}
              <X size={12} className="cursor-pointer ml-1 hover:text-red-500" onClick={() => setFilterTitle("")} />
            </Badge>
          )}
          {filterCategory !== "ALL" && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 flex items-center gap-1.5 rounded-md font-medium border border-blue-100">
              <span className="text-gray-500">ໝວດໝູ່:</span>
              {categories.find(c => String(c.id) === filterCategory)?.name || filterCategory}
              <X size={12} className="cursor-pointer ml-1 hover:text-red-500" onClick={() => setFilterCategory("ALL")} />
            </Badge>
          )}
          {filterFormat !== "ALL" && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 flex items-center gap-1.5 rounded-md font-medium border border-blue-100">
              <span className="text-gray-500">ຮູບແບບ:</span> {filterFormat}
              <X size={12} className="cursor-pointer ml-1 hover:text-red-500" onClick={() => setFilterFormat("ALL")} />
            </Badge>
          )}
          {filterStatus !== "ALL" && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 flex items-center gap-1.5 rounded-md font-medium border border-blue-100">
              <span className="text-gray-500">ສະຖານະ:</span> {STATUS_CONFIG[filterStatus]?.label || filterStatus}
              <X size={12} className="cursor-pointer ml-1 hover:text-red-500" onClick={() => setFilterStatus("ALL")} />
            </Badge>
          )}
          {(filterDateFrom || filterDateTo) && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 flex items-center gap-1.5 rounded-md font-medium border border-blue-100">
              <span className="text-gray-500">ວັນທີ:</span> {filterDateFrom || "ເລີ່ມຕົ້ນ"} → {filterDateTo || "ປັດຈຸບັນ"}
              <X size={12} className="cursor-pointer ml-1 hover:text-red-500" onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }} />
            </Badge>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        {isLoading && courses.length === 0 ? (
          <div className="flex items-center justify-center h-64 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50/80">
                    <TableHead className="w-72 font-semibold text-gray-600 text-xs uppercase tracking-wide">ຫົວຂໍ້ຝຶກອົບຮົມ</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">ໝວດໝູ່</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">ຜູ້ເຂົ້າຮ່ວມ</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide min-w-48">ວັນທີ</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">ສະຖານທີ່</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wide">ສະຖານະ</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600 text-xs uppercase tracking-wide w-16">ຈັດການ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length > 0 ? courses.map((course) => {
                    const statusCfg = STATUS_CONFIG[course.status] ?? { label: course.status, className: "bg-gray-50 text-gray-600 border-gray-200" };
                    return (
                      <TableRow key={course.id}
                        className="hover:bg-blue-50/20 transition-colors border-b border-gray-100 last:border-0">

                        <TableCell className="py-3.5 pr-4">
                          <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{course.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${course.format === TrainingFormat.ONLINE ? "bg-emerald-500" : "bg-blue-500"
                              }`} />
                            <span className="text-[11px] text-gray-400 font-medium">
                              {course.format === TrainingFormat.ONLINE ? "Online" : "On-site"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-600 font-medium">
                            {course.category?.name || "—"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Users size={12} className="text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {course._count?.enrollments ?? course.enrollments?.length ?? 0}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="text-sm text-gray-700 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 w-8">ເລີ່ມ</span>
                              <span className="font-medium">{formatDate(course.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 w-8">ຈົບ</span>
                              <span className="font-medium">{formatDate(course.end_date)}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-gray-500 max-w-44">
                            <MapPin size={12} className="shrink-0 text-gray-400" />
                            <span className="text-sm truncate">
                              {course.format === TrainingFormat.ONLINE
                                ? course.location || "—"
                                : course.location_type === LocationType.DOMESTIC
                                  ? course.location || "—"
                                  : course.country || "—"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge variant="outline" className={`text-xs font-medium ${statusCfg.className}`}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right py-3.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                                <Menu className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                ຕົວເລືອກ
                              </DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/trainings/${course.id}`)} className="cursor-pointer py-2">
                                <Eye className="mr-2.5 h-4 w-4 text-blue-500" />
                                <span className="text-sm">ເບິ່ງລາຍລະອຽດ</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditCourse(course)} className="cursor-pointer py-2">
                                <Edit className="mr-2.5 h-4 w-4 text-amber-500" />
                                <span className="text-sm">ແກ້ໄຂຂໍ້ມູນ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageParticipants(course)} className="cursor-pointer py-2">
                                <UserPlus className="mr-2.5 h-4 w-4 text-emerald-500" />
                                <span className="text-sm">ຈັດການຜູ້ເຂົ້າຮ່ວມ</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageMaterials(course)} className="cursor-pointer py-2">
                                <FolderOpen className="mr-2.5 h-4 w-4 text-purple-500" />
                                <span className="text-sm">ຈັດການເອກະສານ</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => confirmDelete(course.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2">
                                <Trash2 className="mr-2.5 h-4 w-4" />
                                <span className="text-sm font-medium">ລົບຫຼັກສູດ</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-56 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                            <Search className="h-6 w-6 text-gray-300" />
                          </div>
                          <p className="text-sm">ບໍ່ພົບຂໍ້ມູນຫຼັກສູດທີ່ຄົ້ນຫາ</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 0 && (
              <div className="py-3 px-5 border-t border-gray-100 flex flex-col sm:flex-row
                              items-center justify-between gap-4 bg-gray-50/50 mt-auto">
                <p className="text-xs text-gray-500 order-2 sm:order-1">
                  ສະແດງ <span className="font-semibold text-gray-700">{(page - 1) * limit + 1}</span>
                  - <span className="font-semibold text-gray-700">{Math.min(page * limit, total)}</span>
                  &nbsp;ຈາກທັງໝົດ <span className="font-semibold text-gray-700">{total}</span> ລາຍການ
                </p>

                <Pagination className="order-1 sm:order-2 w-auto mx-0">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={e => { e.preventDefault(); handlePageChange(page - 1); }}
                        className={`h-8 px-3 text-xs gap-1 border border-gray-200 bg-white hover:bg-gray-50 ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((p, idx) => (
                      <PaginationItem key={idx}>
                        {p === "..." ? (
                          <PaginationEllipsis className="h-8 w-8 text-gray-400" />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={page === p}
                            onClick={e => { e.preventDefault(); handlePageChange(p as number); }}
                            className={`h-8 w-8 text-xs border ${page === p ? "border-blue-600 bg-blue-50 text-blue-100 font-semibold" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"}`}
                          >
                            {p}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={e => { e.preventDefault(); handlePageChange(page + 1); }}
                        className={`h-8 px-3 text-xs gap-1 border border-gray-200 bg-white hover:bg-gray-50 ${page === totalPages || totalPages === 0 ? "pointer-events-none opacity-40" : ""}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* DIALOG 1: Course Form */}
      {/* ======================================================== */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              {editingCourse ? "ແກ້ໄຂຂໍ້ມູນຫຼັກສູດ" : "ສ້າງຫຼັກສູດໃໝ່"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingCourse ? "ປັບປຸງຂໍ້ມູນທົ່ວໄປ, ສະຖານທີ່ ແລະ ງົບປະມານ" : "ປ້ອນຂໍ້ມູນພື້ນຖານເພື່ອສ້າງຫຼັກສູດໃໝ່"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCourse} className="space-y-5 py-4">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label className="text-sm font-medium">ຫົວຂໍ້ຝຶກອົບຮົມ <span className="text-red-500">*</span></Label>
                <Input placeholder="ໃສ່ຊື່ຫຼັກສູດ..." value={formData.title || ""} onChange={e => handleFormChange("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* 📌 Category in Form (Combobox) */}
                <div className="grid gap-1.5">
                  <Label className="text-sm font-medium">ໝວດໝູ່ <span className="text-red-500">*</span></Label>
                  <Popover open={openFormCategory} onOpenChange={setOpenFormCategory}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFormCategory}
                        className={cn(
                          "w-full justify-between font-normal hover:bg-white",
                          !formData.category_id && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {formData.category_id && formData.category_id !== 0
                            ? categories.find((cat) => cat.id === formData.category_id)?.name
                            : "ເລືອກໝວດໝູ່..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent style={{ width: "var(--radix-popover-trigger-width)" }} className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ຄົ້ນຫາໝວດໝູ່..." />
                        <CommandList>
                          <CommandEmpty>ບໍ່ພົບໝວດໝູ່ທີ່ຄົ້ນຫາ.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((cat) => (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => {
                                  handleFormChange("category_id", cat.id);
                                  setOpenFormCategory(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.category_id === cat.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {cat.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-sm font-medium">ຮູບແບບ <span className="text-red-500">*</span></Label>
                  <Select value={formData.format || TrainingFormat.ONLINE} onValueChange={v => handleFormChange("format", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TrainingFormat.ONSITE}>🏢 On-site</SelectItem>
                      <SelectItem value={TrainingFormat.ONLINE}>🌐 Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-sm font-medium">ວັນທີເລີ່ມ <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formData.start_date?.split("T")[0] || ""} onChange={e => handleFormChange("start_date", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-sm font-medium">ວັນທີສິ້ນສຸດ <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formData.end_date?.split("T")[0] || ""} onChange={e => handleFormChange("end_date", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm font-medium">ລາຍລະອຽດ</Label>
                <textarea placeholder="ອະທິບາຍກ່ຽວກັບຫຼັກສູດ..."
                  className="h-20 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description || ""} onChange={e => handleFormChange("description", e.target.value)} />
              </div>

              <Separator />
              <p className="text-sm font-semibold flex items-center gap-2 text-slate-700 -mb-1">
                <MapPin size={14} /> ສະຖານທີ່
              </p>
              {formData.format === TrainingFormat.ONSITE ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex gap-5">
                    {[LocationType.DOMESTIC, LocationType.INTERNATIONAL].map(lt => (
                      <label key={lt} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={formData.location_type === lt}
                          onChange={() => handleFormChange("location_type", lt)} className="w-4 h-4 text-blue-600" />
                        {lt === LocationType.DOMESTIC ? "ພາຍໃນປະເທດ" : "ຕ່າງປະເທດ"}
                      </label>
                    ))}
                  </div>
                  {formData.location_type === LocationType.DOMESTIC ? (
                    <Input placeholder="ຊື່ສະຖານທີ່ / ຫ້ອງປະຊຸມ" value={formData.location || ""} onChange={e => handleFormChange("location", e.target.value)} />
                  ) : (
                    <Select value={formData.country || ""} onValueChange={v => handleFormChange("country", v)}>
                      <SelectTrigger><SelectValue placeholder="ເລືອກປະເທດ" /></SelectTrigger>
                      <SelectContent>
                        {["Thailand", "Vietnam", "Japan", "China", "Singapore"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <Input placeholder="https://zoom.us/j/..." value={formData.location || ""} onChange={e => handleFormChange("location", e.target.value)} />
              )}

              <Separator />
              <p className="text-sm font-semibold flex items-center gap-2 text-slate-700 -mb-1">
                <GraduationCap size={14} /> ຂໍ້ມູນການຈັດຕັ້ງ & ງົບປະມານ
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-sm">ຜູ້ຝຶກສອນ</Label>
                  <Input placeholder="ຊື່ຜູ້ບັນຍາຍ" value={formData.trainer || ""} onChange={e => handleFormChange("trainer", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-sm">ສະຖາບັນ</Label>
                  <Input placeholder="ສະຖາບັນທີ່ຈັດຝຶກ" value={formData.institution || ""} onChange={e => handleFormChange("institution", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-sm">ໜ່ວຍງານ</Label>
                  <Input placeholder="ພາກສ່ວນຈັດຕັ້ງ" value={formData.organization || ""} onChange={e => handleFormChange("organization", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-sm">ງົບປະມານ</Label>
                  <Input type="text" placeholder="0"
                    value={formData.budget ? Number(String(formData.budget).replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(raw)) || raw === "") handleFormChange("budget", raw);
                    }} />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" type="button" onClick={() => setIsCourseDialogOpen(false)}>ຍົກເລີກ</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-28">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCourse ? "ບັນທຶກການແກ້ໄຂ" : "ສ້າງຫຼັກສູດ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 2: Participants */}
      {/* ======================================================== */}
      <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
        {/* ... (ໂຄ້ດໃນສ່ວນນີ້ຄືເກົ່າບໍ່ມີການປ່ຽນແປງ) ... */}
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> ຈັດການຜູ້ເຂົ້າຮ່ວມ
            </DialogTitle>
            <DialogDescription className="text-sm">
              ຫຼັກສູດ: <span className="font-semibold text-gray-800">{activeCourse?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {isLoadingParticipants ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
              <span className="text-sm text-gray-500">ກຳລັງໂຫຼດ...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-[1fr,1fr,auto] gap-3 items-end">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-gray-600">ລະຫັດພະນັກງານ</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input placeholder="ພິມລະຫັດ 5+ ຕົວ..." className="pl-9 h-9 bg-white text-sm"
                        value={employeeIdSearch}
                        onChange={e => {
                          const v = e.target.value;
                          setEmployeeIdSearch(v);
                          if (v.length >= 5) handleSearchEmployee(v); else setFoundEmployee(null);
                        }}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddParticipant(); } }}
                        disabled={isSearching || isSubmitting} />
                      {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 animate-spin" />}
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-gray-600">ຊື່ພະນັກງານ</Label>
                    <Input readOnly value={foundEmployee?.name || ""} placeholder="ສະແດງອັດຕະໂນມັດ..." className="h-9 bg-white/60 text-sm" />
                  </div>
                  <Button onClick={handleAddParticipant} disabled={!foundEmployee || isSubmitting}
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 px-5">ເພີ່ມ</Button>
                </div>
                {searchError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                    <AlertCircle size={13} /> {searchError}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  ລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ ({addedParticipants.length} ຄົນ)
                </Label>
                {addedParticipants.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
                    ຍັງບໍ່ມີຜູ້ເຂົ້າຮ່ວມ
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {addedParticipants.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-white px-3 py-2
                                                 rounded-lg border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] shrink-0">{p.code}</Badge>
                          <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setAddedParticipants(prev => prev.filter(x => x.id !== p.id))}
                          disabled={isSubmitting} className="h-7 w-7 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0 ml-1">
                          <X size={13} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                <CheckCircle size={13} className="mt-0.5 shrink-0" />
                <span>ຄົ້ນຫາດ້ວຍລະຫັດພະນັກງານ ແລ້ວກົດ ເພີ່ມ. ເມື່ອກົດບັນທຶກ ລະບົບຈະຊິງຄ໌ລາຍຊື່ຄົນໃໝ່ ແລະ ລົບທີ່ຖືກຕັດອອກ.</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsParticipantDialogOpen(false)} disabled={isSubmitting || isLoadingParticipants}>ຍົກເລີກ</Button>
            <Button onClick={handleSubmitParticipants} disabled={isSubmitting || isLoadingParticipants}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-36">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />ກຳລັງບັນທຶກ...</> : `ບັນທຶກ (${addedParticipants.length} ຄົນ)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG 3: Materials */}
      {/* ======================================================== */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        {/* ... (ໂຄ້ດໃນສ່ວນນີ້ຄືເກົ່າບໍ່ມີການປ່ຽນແປງ) ... */}
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FolderOpen size={18} className="text-purple-600" /> ຈັດການເອກະສານ
            </DialogTitle>
            <DialogDescription className="text-sm">
              ຫຼັກສູດ: <span className="font-semibold text-gray-800">{activeCourse?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {isLoadingMaterials ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              <span className="text-sm text-gray-500">ກຳລັງໂຫຼດ...</span>
            </div>
          ) : (
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* File upload zone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ໄຟລ໌ເອກະສານ</Label>
                  <label htmlFor="file-upload"
                    className="flex flex-col items-center justify-center gap-2 h-24
                               border-2 border-dashed border-gray-200 rounded-lg
                               bg-gray-50 hover:bg-purple-50 hover:border-purple-300
                               cursor-pointer transition-colors group">
                    <UploadCloud size={22} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-purple-600">ຄລິກເພື່ອເລືອກໄຟລ໌</span>
                    <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>

                {/* URL input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ລິ້ງ URL</Label>
                  <div className="h-24 bg-purple-50/40 border border-purple-100 rounded-lg p-3 flex flex-col justify-between">
                    <Input placeholder="https://..." className="h-8 text-sm bg-white"
                      value={urlInput} onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }} />
                    <Button type="button" size="sm" onClick={handleAddUrl}
                      className="self-end bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs px-4">
                      + ເພີ່ມລິ້ງ
                    </Button>
                  </div>
                </div>
              </div>

              {/* Queue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">ຄິວລໍຖ້າ</Label>
                  <Badge variant="secondary" className="text-xs">{materialItems.length} ລາຍການ</Badge>
                </div>
                {materialItems.length === 0 ? (
                  <div className="py-5 border border-dashed border-gray-200 rounded-lg text-center text-sm text-gray-400">
                    ຄິວຫວ່າງ
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {materialItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-3 py-2 bg-white
                                                    border border-gray-100 rounded-lg shadow-sm">
                        <div className={`p-1.5 rounded ${item.type === "FILE" ? "bg-blue-50" : "bg-orange-50"}`}>
                          {item.type === "FILE"
                            ? <FileText size={13} className="text-blue-500" />
                            : <LinkIcon size={13} className="text-orange-500" />}
                        </div>
                        <span className="text-sm text-gray-700 truncate flex-1">{item.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {item.type === "FILE" ? "PDF" : "URL"}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => setMaterialItems(prev => prev.filter(x => x.id !== item.id))}
                          className="h-7 w-7 p-0 text-gray-300 hover:text-red-500">
                          <X size={13} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Existing materials */}
              {activeCourse?.materials && activeCourse.materials.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <Label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    ເອກະສານທີ່ມີຢູ່ແລ້ວ ({activeCourse.materials.length})
                  </Label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {activeCourse.materials.map((mat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50
                                                 border border-gray-100 rounded-lg opacity-70">
                        {mat.type === "URL"
                          ? <LinkIcon size={13} className="text-gray-400 shrink-0" />
                          : <FileText size={13} className="text-gray-400 shrink-0" />}
                        <span className="text-xs text-gray-600 truncate flex-1">
                          {mat.file_path_or_link.split('/').pop()}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-gray-400 shrink-0">{mat.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsMaterialDialogOpen(false)} disabled={isSubmitting}>ຍົກເລີກ</Button>
            <Button onClick={handleSubmitMaterials} disabled={isSubmitting || materialItems.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-36">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `ອັບໂຫຼດ (${materialItems.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Alert ── */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ຢືນຢັນການລົບ?</AlertDialogTitle>
            <AlertDialogDescription>ການກະທໍານີ້ບໍ່ສາມາດຍົກເລີກໄດ້.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              ຢືນຢັນລົບ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}