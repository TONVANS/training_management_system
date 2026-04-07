// src/components/tables/categories_table/index.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Layers,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

// UI Components
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Types and Store
import { useCategoryStore } from "@/store/categoryStore";
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { toast } from "sonner";

export function Categories_Table() {
  // Store
  const {
    categories,
    isLoading, // ເພີ່ມການດຶງ isLoading ມາໃຊ້
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategoryStore();

  // Dialog & Alert States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingCategory(null);
      resetForm();
    }
  }, [isDialogOpen]);

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        toast.error("ກະລຸນາປ້ອນຊື່ໝວດໝູ່");
        setIsSubmitting(false);
        return;
      }

      const submitData: CreateCategoryRequest = {
        name: formData.name,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, submitData as UpdateCategoryRequest);
      } else {
        await createCategory(submitData);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Pagination Logic
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteCategory(deletingId);
        setIsAlertOpen(false);
        setDeletingId(null);

        // Reset page ຖ້າລາຍການທີ່ຖືກລົບເປັນລາຍການສຸດທ້າຍຂອງໜ້ານັ້ນ
        if (paginatedCategories.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* --- Header & Actions --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">ໝວດໝູ່ການຝຶກອົບຮົມ</h2>
            <p className="text-sm text-gray-500">Training Categories Management</p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ຄົ້ນຫາໝວດໝູ່..."
              className="pl-9 h-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0">
            <Plus size={18} /> <span className="hidden sm:inline">ເພີ່ມໝວດໝູ່</span>
          </Button>
        </div>
      </div>

      {/* --- Main Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="w-full font-semibold text-gray-700">ຊື່ໝວດໝູ່ (Category Name)</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">ຈຳນວນຫຼັກສູດ</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-500">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                    <TableCell className="py-4 font-medium text-gray-900">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {category._count?.courses || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(category)} className="cursor-pointer gap-2">
                            <Edit className="h-4 w-4 text-gray-500" /> ແກ້ໄຂ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDelete(category.id)}
                            className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" /> ລົບ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                    ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ✨ Pagination Footer */}
        {filteredCategories.length > itemsPerPage && (
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
              ສະແດງ {startIndex + 1} - {Math.min(endIndex, filteredCategories.length)} ຈາກ {filteredCategories.length} ລາຍການ
            </div>
          </div>
        )}
      </div>

      {/* --- Dialog Form (Add/Edit) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "ແກ້ໄຂລາຍລະອຽດຂອງໝວດໝູ່ການຝຶກອົບຮົມ"
                : "ສ້າງໝວດໝູ່ເພື່ອຈັດກຸ່ມຫຼັກສູດຕ່າງໆ"}
            </DialogDescription>
          </DialogHeader>

          {/* ກຳນົດ id ໃຫ້ form ເພື່ອໃຫ້ Button ທາງນອກສາມາດ submit ໄດ້ */}
          <form id="category-form" onSubmit={handleSubmit} className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                ຊື່ໝວດໝູ່ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="ປ້ອນຊື່ໝວດໝູ່..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </form>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="h-10 px-6"
            >
              ຍົກເລີກ
            </Button>
            {/* ໃຊ້ form="category-form" ແລະ type="submit" ເພື່ອໃຫ້ກົດ Enter ແລ້ວ Save ໄດ້ */}
            <Button
              type="submit"
              form="category-form"
              disabled={isSubmitting}
              className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ກຳລັງບັນທຶກ...
                </>
              ) : editingCategory ? (
                "ບັນທຶກການແກ້ໄຂ"
              ) : (
                "ສ້າງໝວດໝູ່"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Alert Dialog (Delete) --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ຢືນຢັນການລົບຂໍ້ມູນ?</AlertDialogTitle>
            <AlertDialogDescription>
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບໝວດໝູ່ນີ້? ການກະທໍານີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              ລົບຂໍ້ມູນ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}