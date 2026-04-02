"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Award,
  Building2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

// Import Store and Types
import { useParticipantListStore } from "@/store/participantListStore";
import { EmployeeTrainingStat } from "@/types/participant";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

// --- Component: ParticipantStatsCard ---
function ParticipantStatsCard({
  data,
  onViewDetail,
}: {
  data: EmployeeTrainingStat;
  onViewDetail: (id: number) => void;
}) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 bg-white">
      <CardContent className="p-5 space-y-5">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-[3px] border-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                <AvatarFallback className="bg-transparent text-white font-bold text-xl">
                  {data.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <h3
                onClick={() => onViewDetail(data.employee_id)}
                className="text-lg font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors"
              >
                {data.full_name}
              </h3>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-mono bg-gray-50 text-gray-600"
                >
                  {data.employee_code}
                </Badge>
                {data.position}
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Info & Stats Row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit">
              <Building2 size={14} className="text-gray-400" />
              <span className="font-medium">{data.department}</span>
            </div>
            {data.division !== "N/A" && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pl-1 max-w-[200px] truncate">
                <BookOpen size={12} /> {data.division}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                ເຂົ້າຮ່ວມອົບຮົມ
              </span>
              <span className="text-2xl font-black text-gray-900 leading-none">
                {data.total_courses_attended}{" "}
                <span className="text-xs font-medium text-gray-400">ຫຼັກສູດ</span>
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Award size={20} />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 gap-2"
          onClick={() => onViewDetail(data.employee_id)}
        >
          ເບິ່ງປະຫວັດການຮຽນ <ArrowRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Main Page Component ---
export default function ParticipantList() {
  const router = useRouter();
  const { trainingStats, paginationMeta, isLoading, fetchTrainingStats } =
    useParticipantListStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================
  // Debounce Search Term
  // ==========================================
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // ==========================================
  // Fetch
  // ==========================================
  const loadPage = useCallback(
    (page: number, searchCode: string) => {
      fetchTrainingStats({
        page,
        limit: ITEMS_PER_PAGE,
        employee_code: searchCode,
      });
    },
    [fetchTrainingStats],
  );

  useEffect(() => {
    if (debouncedSearchTerm === "" || debouncedSearchTerm.length >= 5) {
      setCurrentPage(1);
      loadPage(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, loadPage]);

  // ==========================================
  // Pagination Variables
  // ==========================================
  const totalPages = paginationMeta?.totalPages ?? 1;
  const totalItems = paginationMeta?.total ?? 0;
  const pageStart = paginationMeta
    ? (paginationMeta.page - 1) * paginationMeta.limit + 1
    : 0;
  const pageEnd = paginationMeta
    ? Math.min(paginationMeta.page * paginationMeta.limit, totalItems)
    : 0;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);

    const activeSearch = debouncedSearchTerm.length >= 5 ? debouncedSearchTerm : "";
    loadPage(page, activeSearch);

    // 📌 ເລື່ອນແທັກ <main> ຂຶ້ນເທິງສະເໝີ ເມື່ອປ່ຽນໜ້າ
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    // 📌 ແກ້ໄຂ: ເອົາ pb-10 ອອກ ເພື່ອປ້ອງກັນບໍ່ໃຫ້ເກີດ Margin ຊ້ອນກັນ
    <div className="w-full">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              ລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ (ພະນັກງານ)
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              ຈັດການຂໍ້ມູນ ແລະ ຕິດຕາມສະຖິຕິການຝຶກອົບຮົມ
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ພິມລະຫັດ 4 ຕົວຂຶ້ນໄປເພື່ອຄົ້ນຫາ..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 bg-white"
                disabled={isLoading && searchTerm.length >= 4}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ຂໍ້ຄວາມແຈ້ງເຕືອນເມື່ອພິມບໍ່ຮອດ 5 ຕົວ */}
        {searchTerm.length > 0 && searchTerm.length < 5 && (
          <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md inline-block">
            ກະລຸນາພິມລະຫັດພະນັກງານຢ່າງໜ້ອຍ 5 ຕົວອັກສອນ ເພື່ອເລີ່ມການຄົ້ນຫາ
          </p>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 space-x-2">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        ) : (
          <>
            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
              {trainingStats.length > 0 ? (
                trainingStats.map((data, index) => (
                  <div
                    key={data.employee_id}
                    style={{ animationDelay: `${index * 75}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                  >
                    <ParticipantStatsCard
                      data={data}
                      onViewDetail={(id) =>
                        router.push(`/participant_lists/${id}`)
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <Search className="text-muted-foreground h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground">
                    ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບການຄົ້ນຫາ
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 border-t">
                <Pagination>
                  <PaginationContent>
                    {/* Prev */}
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          !paginationMeta?.hasPrevPage
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page as number);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    {/* Next */}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          !paginationMeta?.hasNextPage
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                {/* Summary */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  ສະແດງ {pageStart} - {pageEnd} ຈາກທັງໝົດ {totalItems} ລາຍການ
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}