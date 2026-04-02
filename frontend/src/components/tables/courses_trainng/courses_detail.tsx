"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    DollarSign,
    Users,
    BookOpen,
    ExternalLink,
    Clock,
    LayoutDashboard,
    Plus,
    Trash2,
    FileText,
    Link as LinkIcon,
    Download,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useCourseStore } from "@/store/courseStore";
import { TrainingFormat, CourseStatus, LocationType } from "@/types/common";
import { AddParticipantModal } from "./add_participant_modal";
import api from "@/util/axios";
import { toast } from "sonner";

// ✅ ສ້າງ URL ສຳລັບເປີດ material ໃຫ້ຖືກ endpoint
const getMaterialUrl = (material: { id: number; type: string; file_path_or_link: string }) => {
    if (material.type === "URL") {
        return material.file_path_or_link;
    }
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    return `${baseURL}/training/materials/${material.id}/download`;
};

export default function CourseDetail() {
    const params = useParams();
    const router = useRouter();
    const courseId = Number(params?.id);

    const { selectedCourse, fetchCourseById, isLoading } = useCourseStore();
    const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);

    const [deletingMaterialId, setDeletingMaterialId] = useState<number | null>(null);
    const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

    // ✅ State ສຳລັບເກັບຂໍ້ມູນເອກະສານທີ່ຕ້ອງການສະແດງໃນ Modal
    const [previewMaterial, setPreviewMaterial] = useState<{ url: string; title: string; type: string } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ✅ ເພີ່ມ Loading State ສຳລັບຕອນກຳລັງດຶງໄຟລ໌ມາເບິ່ງ
    const [isLoadingPreviewId, setIsLoadingPreviewId] = useState<number | null>(null);

    // ✅ ຟັງຊັນສຳລັບດຶງໄຟລ໌ມາສະແດງ (ແບບດຽວກັບ MyLearning)
    const openMaterialPreview = async (material: any, title: string) => {
        if (material.type === "URL") {
            window.open(material.file_path_or_link, "_blank");
            return;
        }

        try {
            setIsLoadingPreviewId(material.id);
            const token = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : '';
            const downloadUrl = getMaterialUrl(material);

            const res = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('ບໍ່ສາມາດໂຫລດເອກະສານໄດ້');

            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);

            setPreviewMaterial({ url: objectUrl, title, type: material.type });
        } catch (error) {
            console.error("Preview error:", error);
            toast.error("ບໍ່ສາມາດເປີດເອກະສານໄດ້ (ອາດຈະບໍ່ມີສິດເຂົ້າເຖິງ ຫຼື ໄຟລ໌ມີບັນຫາ)");
        } finally {
            setIsLoadingPreviewId(null);
        }
    };

    // ✅ Cleanup Object URL ເມື່ອປິດ Modal ເພື່ອບໍ່ໃຫ້ກິນ Memory
    const handleClosePreview = () => {
        if (previewMaterial?.url) {
            URL.revokeObjectURL(previewMaterial.url);
        }
        setPreviewMaterial(null);
    };

    useEffect(() => {
        if (courseId) {
            fetchCourseById(courseId);
        }
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleParticipantAdded = () => {
        if (courseId) fetchCourseById(courseId);
    };

    const handleDeleteMaterial = async () => {
        if (!deletingMaterialId || !courseId) return;
        setIsDeletingMaterial(true);
        try {
            await api.delete(`/training/courses/${courseId}/materials/${deletingMaterialId}`);
            toast.success("ລົບເອກະສານສຳເລັດແລ້ວ");
            fetchCourseById(courseId);
        } catch {
            toast.error("ບໍ່ສາມາດລົບເອກະສານໄດ້");
        } finally {
            setIsDeletingMaterial(false);
            setDeletingMaterialId(null);
        }
    };

    // ✅ ຟັງຊັນສຳລັບບັງຄັບດາວໂຫຼດໄຟລ໌
    const forceDownload = async (url: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsDownloading(true);
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : '' : ''}`
                }
            });

            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} ${response.statusText}`);
                throw new Error(`Network error: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;

            const filename = url.split('/').pop()?.split('?')[0] || "document.pdf";
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("ບັງຄັບດາວໂຫຼດລົ້ມເຫຼວ:", error);
            window.open(url, "_blank");
        } finally {
            setIsDownloading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("la-LA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading || !selectedCourse) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">ກຳລັງໂຫລດຂໍ້ມູນລາຍລະອຽດ...</p>
            </div>
        );
    }

    const course = selectedCourse;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full shadow-sm hover:bg-gray-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {course.title}
                        </h1>
                        <Badge
                            variant="outline"
                            className={
                                course.status === CourseStatus.ACTIVE
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : course.status === CourseStatus.SCHEDULED
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : course.status === CourseStatus.COMPLETED
                                            ? "bg-gray-50 text-gray-700 border-gray-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                            }
                        >
                            {course.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        ໝວດໝູ່:{" "}
                        <span className="font-medium text-gray-700">
                            {course.category?.name || "ບໍ່ລະບຸ"}
                        </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Information Card */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                ລາຍລະອຽດຫຼັກສູດ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {course.description || "ບໍ່ມີລາຍລະອຽດ"}
                            </p>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">ໄລຍະເວລາ</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                {formatDate(course.start_date)} -{" "}
                                                {formatDate(course.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg shrink-0">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">ງົບປະມານ</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                {course.budget
                                                    ? `${Number(course.budget).toLocaleString()} USD/KIP`
                                                    : "0"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                                            <MapPin className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500 font-medium">
                                                ສະຖານທີ່ (
                                                {course.format === TrainingFormat.ONLINE
                                                    ? "Online"
                                                    : "On-site"}
                                                )
                                            </p>
                                            <div className="text-sm font-semibold text-gray-900 mt-0.5">
                                                {course.format === TrainingFormat.ONLINE ? (
                                                    <a
                                                        href={course.location || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                                    >
                                                        {course.location || "ບໍ່ໄດ້ລະບຸລິ້ງຄ໌"}
                                                        {course.location && (
                                                            <ExternalLink className="w-3 h-3" />
                                                        )}
                                                    </a>
                                                ) : (
                                                    <p>
                                                        {course.location_type === LocationType.DOMESTIC
                                                            ? course.location
                                                            : course.country || "ບໍ່ໄດ້ລະບຸ"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enrollments List Card */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    ລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    ລວມທັງໝົດ {course.enrollments?.length || 0} ຄົນ
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setIsAddParticipantModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Participant
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        <TableHead>ລະຫັດພະນັກງານ</TableHead>
                                        <TableHead>ຊື່ ແລະ ນາມສະກຸນ</TableHead>
                                        <TableHead>ສະຖານະ</TableHead>
                                        <TableHead className="text-right pr-6">
                                            ວັນທີລົງທະບຽນ
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.enrollments && course.enrollments.length > 0 ? (
                                        course.enrollments.map((enrollment, index) => (
                                            <TableRow
                                                key={enrollment.id}
                                                className="hover:bg-blue-50/30"
                                            >
                                                <TableCell className="text-center text-gray-500">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {enrollment.employee?.employee_code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {enrollment.employee?.first_name_la}{" "}
                                                    {enrollment.employee?.last_name_la}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-700 font-normal"
                                                    >
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 text-gray-500 text-sm">
                                                    {formatDate(enrollment.enrolled_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                ຍັງບໍ່ມີຜູ້ເຂົ້າຮ່ວມໃນຫຼັກສູດນີ້
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Materials Card */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                ເອກະສານປະກອບ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4">
                            {course.materials && course.materials.length > 0 ? (
                                <ul className="space-y-3">
                                    {course.materials.map((material, index) => {
                                        const isUrl = material.type === "URL";
                                        const openUrl = getMaterialUrl(material);
                                        const materialTitle = isUrl ? "URL Link" : `ເອກະສານ ${index + 1}`;

                                        return (
                                            <li
                                                key={material.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="bg-white p-2 rounded shadow-sm shrink-0">
                                                        {isUrl ? (
                                                            <LinkIcon className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-orange-600" />
                                                        )}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-gray-700 truncate">
                                                            {materialTitle}
                                                        </p>
                                                        {isUrl && (
                                                            <p className="text-xs text-gray-400 truncate max-w-[140px]">
                                                                {material.file_path_or_link}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => openMaterialPreview(material, materialTitle)}
                                                        disabled={isLoadingPreviewId === material.id}
                                                        className="text-blue-600 text-xs font-semibold hover:underline px-1 cursor-pointer bg-transparent border-none disabled:opacity-50 inline-flex items-center gap-1"
                                                    >
                                                        {isLoadingPreviewId === material.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {isLoadingPreviewId === material.id ? "ກຳລັງໂຫລດ..." : "ເປີດເບິ່ງ"}
                                                    </button>
                                                    {/* ປຸ່ມລົບ — ໂຊว์ເມື່ອ hover */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                        onClick={() =>
                                                            setDeletingMaterialId(material.id)
                                                        }
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    ບໍ່ມີເອກະສານປະກອບສຳລັບຫຼັກສູດນີ້
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="shadow-sm border-gray-200 bg-linear-to-b from-white to-gray-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> ສ້າງເມື່ອ
                                </span>
                                <span className="font-medium text-gray-700">
                                    {formatDate(course.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> ອັບເດດລ່າສຸດ
                                </span>
                                <span className="font-medium text-gray-700">
                                    {formatDate(course.updated_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Participant Modal */}
            <AddParticipantModal
                courseId={courseId}
                isOpen={isAddParticipantModalOpen}
                onClose={() => setIsAddParticipantModalOpen(false)}
                onParticipantAdded={handleParticipantAdded}
            />

            {/* Confirm Delete Material Dialog */}
            <AlertDialog
                open={deletingMaterialId !== null}
                onOpenChange={(open: boolean) => {
                    if (!open) setDeletingMaterialId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ຢືນຢັນການລົບເອກະສານ</AlertDialogTitle>
                        <AlertDialogDescription>
                            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບເອກະສານນີ້?
                            ການດຳເນີນການນີ້ບໍ່ສາມາດກູ້ຄືນໄດ້.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingMaterial}>
                            ຍົກເລີກ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteMaterial}
                            disabled={isDeletingMaterial}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeletingMaterial ? "ກຳລັງລົບ..." : "ລົບເອກະສານ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ✅ Document Preview Modal (Custom Modal ຮູບແບບດຽວກັບ MyLearningPage) */}
            {previewMaterial && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                    onClick={handleClosePreview} // ✅ ປ່ຽນບ່ອນນີ້
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10">
                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                <FileText size={20} className="text-blue-500" /> {previewMaterial.title}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => forceDownload(previewMaterial.url, e)}
                                    disabled={isDownloading}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                                >
                                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                    {isDownloading ? "ກຳລັງດາວໂຫຼດ..." : "ດາວໂຫຼດ"}
                                </button>
                                <button
                                    onClick={handleClosePreview} // ✅ ປ່ຽນບ່ອນນີ້
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex-1 overflow-hidden min-h-[75vh]">
                            <object
                                data={`${previewMaterial.url}#zoom=70&toolbar=1&navpanes=0`}
                                type="application/pdf"
                                className="w-full h-full min-h-[75vh] bg-gray-50"
                            >
                                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-gray-50">
                                    <FileText size={48} className="text-gray-300" />
                                    <p className="text-sm text-gray-500">ບຣາວເຊີບໍ່ຮອງຮັບການສະແດງ PDF</p>
                                    <button
                                        onClick={(e) => forceDownload(previewMaterial.url, e)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        ດາວໂຫຼດແທນ
                                    </button>
                                </div>
                            </object>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}