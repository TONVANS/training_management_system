// src/app/(site)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, GraduationCap, RefreshCw, X, Filter, Award, ChevronRight } from 'lucide-react';
import { RecentTrainingTable } from '@/components/dashboard/recentTrainingTable';
import { StatCard } from '@/components/dashboard/statCard';
import { useDashboardStore } from '@/store/dashboardStore';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { dashboardData, isLoading, fetchDashboardData, refetch, dateFilter, clearDateFilter } = useDashboardStore();
    const [startDate, setStartDate] = useState<string>(dateFilter.startDate || '');
    const [endDate, setEndDate] = useState<string>(dateFilter.endDate || '');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFilterApply = () => {
        fetchDashboardData(startDate || undefined, endDate || undefined);
        setShowFilter(false);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        clearDateFilter();
        fetchDashboardData();
        setShowFilter(false);
    };

    if (isLoading && !dashboardData) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 p-8 flex justify-center items-center min-h-[70vh]">
                <div className="space-y-4 text-center">
                    <div className="w-16 h-16 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
                </div>
            </div>
        );
    }

    const overview = dashboardData?.overview || {
        total_employees: 0, total_courses: 0, active_courses: 0, upcoming_courses: 0, total_enrollments: 0, total_annual_budget_used: 0,
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

            {/* ── Luxury Hero Banner ── */}
            <div className="relative bg-gradient-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] rounded-3xl p-8 sm:p-10 shadow-xl shadow-blue-900/10 overflow-hidden">
                {/* Abstract shapes for luxury feel */}
                <div className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] bg-[#ffb13b]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">
                            ພາບລວມລະບົບ <span className="text-[#ffb13b]">(Dashboard)</span>
                        </h1>
                        <p className="text-blue-100 font-medium text-sm sm:text-base max-w-lg opacity-90">
                            ຍິນດີຕ້ອນຮັບ! ຕິດຕາມສະຖິຕິການຝຶກອົບຮົມ, ງົບປະມານ ແລະ ພາບລວມຂອງບຸກຄະລາກອນໄດ້ໃນໜ້າດຽວ.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilter(!showFilter)}
                            className="bg-white/10 hover:bg-white/20 text-white border-0 shadow-none backdrop-blur-md rounded-xl h-12 px-5 font-bold flex-1 md:flex-none"
                        >
                            <Filter size={18} className="mr-2" /> ຕົວກອງວັນທີ
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="bg-white text-[#0a468c] hover:bg-gray-50 rounded-xl h-12 w-12 shadow-lg"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                    </div>
                </div>

                {/* Date Filter Dropdown (Animated) */}
                {showFilter && (
                    <div className="mt-6 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full">
                                <label className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">ເລີ່ມຕົ້ນ</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/90 border-0 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#ffb13b] font-medium"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">ສິ້ນສຸດ</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/90 border-0 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#ffb13b] font-medium"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button onClick={handleFilterApply} className="bg-[#ffb13b] hover:bg-[#e59e35] text-blue-950 font-bold h-12 px-6 rounded-xl w-full sm:w-auto">
                                    ຄົ້ນຫາ
                                </Button>
                                {(startDate || endDate) && (
                                    <Button onClick={handleClearFilters} variant="destructive" className="h-12 px-4 rounded-xl">
                                        <X size={20} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── 1. Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="ຫຼັກສູດທັງໝົດ"
                    value={overview.total_courses.toLocaleString()}
                    change={`ມີ ${overview.active_courses} ຫຼັກສູດກຳລັງເປີດ`}
                    trend="up"
                    icon={<BookOpen size={24} />}
                />
                <StatCard
                    title="ຜູ້ເຂົ້າຮ່ວມ (Enrollments)"
                    value={overview.total_enrollments.toLocaleString()}
                    change={`ຈາກພະນັກງານ ${overview.total_employees} ຄົນ`}
                    trend="up"
                    icon={<Users size={24} />}
                />
                <StatCard
                    title="ລໍຖ້າເປີດສອນ (Upcoming)"
                    value={String(overview.upcoming_courses)}
                    change="ແຜນຈັດຕັ້ງໃນອະນາຄົດ"
                    trend="neutral"
                    icon={<Calendar size={24} />}
                />
                <StatCard
                    title="ງົບປະມານນຳໃຊ້ແລ້ວ"
                    value={`${overview.total_annual_budget_used?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0'} ₭`}
                    change="ລວມຍອດງົບປະມານທັງໝົດ"
                    trend="neutral"
                    icon={<GraduationCap size={24} />}
                />
            </div>

            {/* ── 2. Main Content Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Recent Table */}
                <div className="xl:col-span-2 flex flex-col h-full">
                    <RecentTrainingTable
                        upcomingCourses={dashboardData?.upcoming_courses || []}
                        isLoading={isLoading}
                    />
                </div>

                {/* Right Column: Mini Widgets */}
                <div className="flex flex-col gap-8">

                    {/* Widget A: Upcoming Shortlist */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">ຈະມາເຖິງໄວໆນີ້</h3>
                            <span className="bg-blue-50 text-[#1275e2] text-xs font-bold px-3 py-1 rounded-full">30 ມື້ໜ້າ</span>
                        </div>

                        {dashboardData?.upcoming_courses && dashboardData.upcoming_courses.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.upcoming_courses.slice(0, 4).map((course) => (
                                    <div key={course.id} className="group flex items-center gap-4 p-3.5 bg-white border border-gray-100 rounded-2xl hover:border-[#1275e2]/30 hover:shadow-md transition-all cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex flex-col items-center justify-center text-[#1275e2] shadow-inner group-hover:scale-105 transition-transform">
                                            <span className="text-sm font-extrabold leading-none">{course.days_until_start}</span>
                                            <span className="text-[10px] font-bold uppercase mt-0.5">Days</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#1275e2] transition-colors">{course.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">{course.enrolled_count} ຜູ້ລົງທະບຽນ</p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1275e2] transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400 font-medium">ບໍ່ມີແຜນຝຶກອົບຮົມໃນ 30 ມື້ຂ້າງໜ້າ</p>
                            </div>
                        )}
                    </div>

                    {/* Widget B: Top Performing Courses (Now Active and Beautiful) */}
                    {/* <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-8 relative overflow-hidden">
                      
                        <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-50 opacity-50 pointer-events-none rotate-12" />

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                                <Award size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-none">Top ຫຼັກສູດດີເດັ່ນ</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">ວັດຈາກອັດຕາການຮຽນຈົບ (%)</p>
                            </div>
                        </div>

                        {dashboardData?.top_performing_courses && dashboardData.top_performing_courses.length > 0 ? (
                            <div className="space-y-5 relative z-10">
                                {dashboardData.top_performing_courses.slice(0, 4).map((course, index) => (
                                    <div key={course.id} className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <span className="text-xs font-black text-gray-300 w-4 pt-0.5">{index + 1}.</span>
                                                <p className="text-sm font-bold text-gray-700 truncate" title={course.title}>{course.title}</p>
                                            </div>
                                            <span className="text-sm font-black text-[#0a468c] bg-blue-50 px-2 py-0.5 rounded-md">
                                                {(course.completion_rate).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 pl-6">
                                            <div
                                                className="bg-gradient-to-r from-[#1275e2] to-[#0a468c] h-2 rounded-full relative shadow-sm"
                                                style={{ width: `${Math.max(course.completion_rate, 5)}%` }}
                                            >
                                             
                                                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 relative z-10">
                                <p className="text-sm text-gray-400 font-medium">ຍັງບໍ່ມີຂໍ້ມູນການປະເມີນ</p>
                            </div>
                        )}
                    </div> */}

                </div>
            </div>
        </div>
    );
}