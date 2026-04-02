// src/components/reports/index.tsx
"use client";
import { useEffect, useState } from "react";
import { FileText, Printer, Eye, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useReportStore } from "@/store/report/reportStore";
import { ReportPeriodType } from "@/types/report";
import { format } from "date-fns";
import { generatePreviewHtmlUrl, downloadReportPDF, formatCurrency } from "@/util/pdfReport";
import { toast } from "sonner";

export function TrainingReport() {
    const { reportData, isLoading, fetchReport } = useReportStore();
    const [isDownloading, setIsDownloading] = useState(false);

    const currentYear = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState<number>(currentYear);
    const [filterType, setFilterType] = useState<ReportPeriodType>("MONTHLY");
    const [filterValue, setFilterValue] = useState<number>(new Date().getMonth() + 1);

    useEffect(() => {
        // ຖ້າປະເພດເປັນ YEARLY, ສົ່ງ undefined ແທນ filterValue
        const valueToSend = filterType === "YEARLY" ? undefined : filterValue;
        fetchReport(filterYear, filterType, valueToSend);
    }, [filterYear, filterType, filterValue, fetchReport]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as ReportPeriodType;
        setFilterType(newType);
        // Reset ຄ່າ value ເປັນ 1 ຖ້າບໍ່ແມ່ນລາຍງານປະຈຳປີ ເພື່ອປ້ອງກັນ error ຈາກຄ່າເກົ່າ
        if (newType !== "YEARLY") {
            setFilterValue(1);
        }
    };

    const renderValueOptions = () => {
        if (filterType === "MONTHLY") {
            return Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>ເດືອນ {i + 1}</option>
            ));
        }
        if (filterType === "QUARTERLY") {
            return Array.from({ length: 4 }, (_, i) => (
                <option key={i + 1} value={i + 1}>ໄຕມາດ {i + 1}</option>
            ));
        }
        if (filterType === "HALF_YEARLY") {
            return [
                <option key={1} value={1}>6 ເດືອນຕົ້ນປີ (1-6)</option>,
                <option key={2} value={2}>6 ເດືອນທ້າຍປີ (7-12)</option>,
            ];
        }
        return null;
    };

    const handlePreview = () => {
        if (!reportData) return;
        const url = generatePreviewHtmlUrl(reportData);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    const handleDownloadPdf = async () => {
        if (!reportData) return;
        setIsDownloading(true);
        toast.info("ກຳລັງສ້າງເອກະສານ PDF ກະລຸນາລໍຖ້າ...");
        try {
            await downloadReportPDF(reportData);
            toast.success("Print PDF ສຳເລັດແລ້ວ!");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">ລາຍງານການຝຶກອົບຮົມ</h2>
                        <p className="text-sm text-gray-500">Training Summary Report</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        <Filter size={16} className="text-gray-400 ml-2" />
                        <select
                            className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer outline-none"
                            value={filterType}
                            onChange={handleTypeChange}
                        >
                            <option value="MONTHLY">ປະຈຳເດືອນ</option>
                            <option value="QUARTERLY">ປະຈຳໄຕມາດ</option>
                            <option value="HALF_YEARLY">ປະຈຳ 6 ເດືອນ</option>
                            <option value="YEARLY">ປະຈຳປີ</option> {/* <-- ເພີ່ມຕົວເລືອກປະຈຳປີ */}
                        </select>

                        {/* ເຊື່ອງ Dropdown ນີ້ຖ້າເລືອກລາຍງານປະຈຳປີ (YEARLY) */}
                        {filterType !== "YEARLY" && (
                            <>
                                <div className="w-px h-4 bg-gray-300 mx-1" />
                                <select
                                    className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer outline-none"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(Number(e.target.value))}
                                >
                                    {renderValueOptions()}
                                </select>
                            </>
                        )}

                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <select
                            className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer outline-none mr-2"
                            value={filterYear}
                            onChange={(e) => setFilterYear(Number(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* ... ປຸ່ມ Preview ແລະ Print PDF ຄືເກົ່າທຸກຢ່າງ ... */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handlePreview}
                            disabled={!reportData || reportData.data.length === 0}
                            variant="outline"
                            className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                            <Eye size={18} />
                            <span className="hidden sm:inline">ເບິ່ງຕົວຢ່າງ</span>
                        </Button>
                        <Button
                            onClick={handleDownloadPdf}
                            disabled={!reportData || reportData.data.length === 0 || isDownloading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                        >
                            {isDownloading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Printer size={18} />}
                            <span>Print PDF</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dashboard Table */}
            {/* ❌ ຖັນ "ລວມ" ຜູ້ເຂົ້າຝຶກຖືກຕັດອອກ — colspan 3→2 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto p-1">
                    <Table className="min-w-[1000px]">
                        <TableHeader className="bg-gray-50/80">
                            <TableRow className="border-b border-gray-200 text-xs">
                                <TableHead rowSpan={2} className="text-center w-12 border-r">ລ/ດ</TableHead>
                                <TableHead rowSpan={2} className="border-r w-48">ຫົວຂໍ້ຝຶກອົບຮົມ</TableHead>
                                {/* colspan 3→2 */}
                                <TableHead colSpan={2} className="text-center border-r">ຈຳນວນຜູ້ເຂົ້າຝຶກ</TableHead>
                                <TableHead colSpan={2} className="text-center border-r">ໄລຍະເວລາ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r w-14">ມື້</TableHead>
                                <TableHead colSpan={2} className="text-center border-r">ສະຖານທີ່ຝຶກ</TableHead>
                                <TableHead rowSpan={2} className="border-r w-32">ຊື່ສະຖາບັນ/ອົງກອນ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r w-20">ຮູບແບບ</TableHead>
                                <TableHead rowSpan={2} className="text-right border-r w-28">ງົບປະມານ (ກີບ)</TableHead>
                                <TableHead rowSpan={2} className="border-r w-16">ໝາຍເຫດ</TableHead>
                            </TableRow>
                            <TableRow className="border-b border-gray-200 text-xs bg-gray-50/50">
                                <TableHead className="text-center border-r font-normal">ເຕັກນິກ</TableHead>
                                <TableHead className="text-center border-r font-normal">ບໍລິຫານ</TableHead>
                                <TableHead className="text-center border-r font-normal">ມື້ເລີ່ມ</TableHead>
                                <TableHead className="text-center border-r font-normal">ມື້ສິ້ນສຸດ</TableHead>
                                <TableHead className="text-center border-r font-normal">ໃນ</TableHead>
                                <TableHead className="text-center border-r font-normal">ນອກ</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                                        <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...</p>
                                    </TableCell>
                                </TableRow>
                            ) : reportData?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-32 text-center text-gray-500">
                                        ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງເວລານີ້
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {reportData?.data.map((row) => (
                                        <TableRow key={row.no} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                                            <TableCell className="text-center border-r">{row.no}</TableCell>
                                            <TableCell className="font-medium border-r truncate max-w-[200px]" title={row.course_title}>
                                                {row.course_title}
                                            </TableCell>
                                            <TableCell className="text-center border-r">{row.attendees.technical || "-"}</TableCell>
                                            <TableCell className="text-center border-r">{row.attendees.administrative || "-"}</TableCell>
                                            <TableCell className="text-center border-r">{format(new Date(row.duration.start_date), "dd/MM")}</TableCell>
                                            <TableCell className="text-center border-r">{format(new Date(row.duration.end_date), "dd/MM")}</TableCell>
                                            <TableCell className="text-center border-r">{row.duration.total_days}</TableCell>
                                            <TableCell className="text-center border-r">{row.location.is_domestic ? "✓" : ""}</TableCell>
                                            <TableCell className="text-center border-r">{row.location.is_international ? "✓" : ""}</TableCell>
                                            <TableCell className="border-r truncate max-w-[120px]" title={row.institution}>{row.institution}</TableCell>
                                            <TableCell className="text-center border-r">{row.format}</TableCell>
                                            <TableCell className="text-right border-r font-medium text-gray-700">{formatCurrency(row.budget)}</TableCell>
                                            <TableCell className="border-r" />
                                        </TableRow>
                                    ))}

                                    {/* Summary Row */}
                                    {reportData?.summary && (
                                        <TableRow className="bg-indigo-50 font-semibold border-t-2 border-indigo-200 text-xs">
                                            <TableCell colSpan={2} className="text-right border-r text-indigo-900">
                                                ລວມທັງໝົດ ({reportData.summary.total_courses} ຫຼັກສູດ)
                                            </TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_technical}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_administrative}</TableCell>
                                            <TableCell colSpan={2} className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_days}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_domestic}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_international}</TableCell>
                                            <TableCell className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700 font-normal text-[10px]">
                                                ON:{reportData.summary.total_online} / IN:{reportData.summary.total_onsite}
                                            </TableCell>
                                            <TableCell className="text-right border-r text-indigo-900">
                                                {formatCurrency(reportData.summary.total_budget)}
                                            </TableCell>
                                            <TableCell className="border-r" />
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}