// src/components/tables/role_management_table/index.tsx
"use client";

import { useEffect, useState } from "react";
import {
    Search,
    ShieldAlert,
    ShieldCheck,
    UserCog,
    Loader2,
    KeyRound, // 📌 ເພີ່ມ Icon ສຳລັບປຸ່ມ Reset
    AlertTriangle // 📌 ເພີ່ມ Icon ສຳລັບແຈ້ງເຕືອນໃນ Dialog
} from "lucide-react";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

import { useRoleStore } from "@/store/roleStore";
import { EmployeeInfo, Role } from "@/types/auth";

export function RoleManagementTable() {
    const {
        employees,
        isLoading,
        isSubmitting,
        page,
        limit,
        totalPages,
        total,
        fetchEmployees,
        changeRole
    } = useRoleStore();

    const [searchQuery, setSearchQuery] = useState("");

    // --- Role Dialog States ---
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeInfo | null>(null);
    const [newRole, setNewRole] = useState<Role | string>(Role.EMPLOYEE);

    // --- Reset Password Dialog States 📌 ---
    const { resetPassword } = useRoleStore();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [employeeToReset, setEmployeeToReset] = useState<EmployeeInfo | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEmployees(1, limit, searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchEmployees, limit]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchEmployees(newPage, limit, searchQuery);
        }
    };

    // --- Handlers ສຳລັບປ່ຽນສິດ ---
    const handleEditRole = (employee: EmployeeInfo) => {
        setSelectedEmployee(employee);
        setNewRole(employee.role);
        setIsRoleDialogOpen(true);
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            await changeRole({
                employee_code: selectedEmployee.employee_code,
                new_role: newRole,
            });
            setIsRoleDialogOpen(false);
            setSelectedEmployee(null);
        } catch (error) {
            console.error(error);
        }
    };

    // --- Handlers ສຳລັບ Reset Password 📌 ---
    const handleOpenResetDialog = (employee: EmployeeInfo) => {
        setEmployeeToReset(employee);
        setIsResetDialogOpen(true);
    };

    const handleConfirmResetPassword = async () => {
        if (!employeeToReset) return;

        setIsResetting(true);
        try {
            // ເອີ້ນໃຊ້ຈາກ Store ແທນການເອີ້ນ api.post ໂດຍກົງ
            await resetPassword(employeeToReset.employee_code);

            alert(`ຣີເຊັດລະຫັດຜ່ານສຳລັບ ${employeeToReset.employee_code} ສຳເລັດແລ້ວ!`);
            setIsResetDialogOpen(false);
            setEmployeeToReset(null);
        } catch (error) {
            alert("ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ, ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.");
        } finally {
            setIsResetting(false);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
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

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <UserCog size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">ຈັດການສິດການເຂົ້າເຖິງ</h2>
                        <p className="text-sm text-gray-500">Role & Password Management</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="ຄົ້ນຫາລະຫັດ ຫຼື ຊື່ພະນັກງານ..."
                        className="pl-9 h-10 bg-gray-50 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* --- Main Table --- */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/80">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="w-32 font-semibold">ລະຫັດພະນັກງານ</TableHead>
                                <TableHead className="font-semibold">ຊື່ ແລະ ນາມສະກຸນ</TableHead>
                                <TableHead className="w-40 font-semibold text-center">ບົດບາດ (Role)</TableHead>
                                <TableHead className="w-48 text-right font-semibold">ຈັດການ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
                                        <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນພະນັກງານ...</p>
                                    </TableCell>
                                </TableRow>
                            ) : employees.length > 0 ? (
                                employees.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
                                        <TableCell className="py-3 font-medium text-gray-900">
                                            {emp.employee_code}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {emp.first_name_la} {emp.last_name_la}
                                        </TableCell>
                                        <TableCell className="py-3 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${emp.role === "ADMIN"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {emp.role === "ADMIN" ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                                {emp.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            {/* 📌 ເພີ່ມປຸ່ມ Reset Password ຢູ່ຂ້າງໆປຸ່ມປ່ຽນສິດ */}
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8"
                                                    onClick={() => handleEditRole(emp)}
                                                >
                                                    ປ່ຽນສິດ
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2"
                                                    title="ຣີເຊັດລະຫັດຜ່ານ"
                                                    onClick={() => handleOpenResetDialog(emp)}
                                                >
                                                    <KeyRound size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                        ບໍ່ພົບຂໍ້ມູນພະນັກງານ
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination (ຄົງເດີມ) */}
                {totalPages > 0 && (
                    <div className="py-3 px-5 border-t border-gray-100 flex flex-col sm:flex-row
                          items-center justify-between gap-4 bg-gray-50/50 mt-auto">
                        <p className="text-xs text-gray-500 order-2 sm:order-1">
                            ສະແດງ <span className="font-semibold text-gray-700">{(page - 1) * limit + 1}</span>
                            {' '}-{' '}
                            <span className="font-semibold text-gray-700">{Math.min(page * limit, total)}</span>
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
                                                className={`h-8 w-8 text-xs border ${page === p
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-100 font-semibold"
                                                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                                                    }`}
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
            </div>

            {/* --- Change Role Dialog --- */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>ປ່ຽນສິດການເຂົ້າເຖິງ</DialogTitle>
                        <DialogDescription>
                            ປ່ຽນບົດບາດ (Role) ສຳລັບພະນັກງານລະຫັດ: <span className="font-bold text-gray-900">{selectedEmployee?.employee_code}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form id="role-form" onSubmit={handleRoleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>ຊື່ພະນັກງານ</Label>
                            <Input
                                disabled
                                value={`${selectedEmployee?.first_name_la || ""} ${selectedEmployee?.last_name_la || ""}`}
                                className="bg-gray-50 text-gray-900"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>ເລືອກບົດບາດໃໝ່ (Role) <span className="text-red-500">*</span></Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="ເລືອກ Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EMPLOYEE">ຜູ້ໃຊ້ທົ່ວໄປ</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsRoleDialogOpen(false)}
                        >
                            ຍົກເລີກ
                        </Button>
                        <Button
                            type="submit"
                            form="role-form"
                            disabled={isSubmitting || newRole === selectedEmployee?.role}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            ບັນທຶກ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- 📌 Reset Password Confirmation Dialog --- */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="mb-4 rounded-full bg-amber-100 p-3">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-xl">ຢືນຢັນການຣີເຊັດລະຫັດຜ່ານ</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            ທ່ານແນ່ໃຈຫຼືບໍ່ທີ່ຈະຣີເຊັດລະຫັດຜ່ານຂອງພະນັກງານ: <br />
                            <span className="font-bold text-gray-900 text-base">{employeeToReset?.employee_code}</span>
                            <br /><br />
                            ລະຫັດຜ່ານຈະຖືກປ່ຽນເປັນຄ່າເລີ່ມຕົ້ນ: <span className="font-mono font-bold text-indigo-600">EDL@123456</span>
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsResetDialogOpen(false)}
                            disabled={isResetting}
                        >
                            ຍົກເລີກ
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmResetPassword}
                            disabled={isResetting}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                            ຢືນຢັນການຣີເຊັດ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}