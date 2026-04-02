// src/reports/reports.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationType, CourseStatus } from '@prisma/client';

export enum ReportPeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY', // <-- ເພີ່ມລາຍງານປະຈຳປີ
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ດຶງຂໍ້ມູນລາຍງານການຝຶກອົບຮົມ
   * @param year ປີທີ່ຕ້ອງການດຶງ (ເຊັ່ນ: 2026)
   * @param type ປະເພດລາຍງານ (MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY)
   * @param value ຄ່າຂອງປະເພດນັ້ນ (ເຊັ່ນ: ເດືອນ 1-12, ໄຕມາດ 1-4, ເຄິ່ງປີ 1-2)
   */
  async getTrainingReport(year: number, type: ReportPeriodType, value: number) {
    // 1. ຄຳນວນວັນທີເລີ່ມຕົ້ນ ແລະ ສິ້ນສຸດ ຕາມປະເພດລາຍງານ
    const { startDate, endDate } = this.getDateRange(year, type, value);

    // 2. ດຶງຂໍ້ມູນ Course ທີ່ຢູ່ໃນຊ່ວງເວລາດັ່ງກ່າວ
    const courses = await this.prisma.course.findMany({
      where: {
        start_date: {
          gte: startDate,
          lte: endDate,
        },
        // Filter ບໍ່ເອົາຫຼັກສູດທີ່ຖືກຍົກເລີກ
        status: {
          not: CourseStatus.CANCELLED,
        },
      },
      select: {
        id: true,
        title: true,
        start_date: true,
        end_date: true,
        location_type: true,
        location: true,
        country: true,
        institution: true,
        organization: true,
        format: true,
        description: true,
        budget: true, 
        enrollments: {
          select: {
            employee: {
              select: {
                special_subject_id: true,
              },
            },
          },
        },
      },
      orderBy: {
        start_date: 'asc',
      },
    });

    // 3. ແປງຂໍ້ມູນໃຫ້ເຂົ້າກັບ Column ໃນ File PDF
    const reportData = courses.map((course, index) => {
      let techCount = 0;
      let adminCount = 0;

      course.enrollments.forEach((enrollment) => {
        const subjectId = enrollment.employee?.special_subject_id;

        if (subjectId === 1) {
          techCount++;
        } else if (subjectId === 2) {
          adminCount++;
        }
      });

      const diffTime = Math.abs(
        course.end_date.getTime() - course.start_date.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

      return {
        no: index + 1,
        course_title: course.title,
        budget: Number(course.budget), 
        attendees: {
          technical: techCount,
          administrative: adminCount,
          total: techCount + adminCount,
        },
        duration: {
          start_date: course.start_date,
          end_date: course.end_date,
          total_days: diffDays,
        },
        location: {
          is_domestic: course.location_type === LocationType.DOMESTIC,
          is_international: course.location_type === LocationType.INTERNATIONAL,
          detail: course.location || course.country || 'N/A',
        },
        institution: course.institution || course.organization || 'N/A',
        format: course.format,
        remark: course.description || '',
      };
    });

    // 4. ສ້າງ Summary ລວມຍອດທ້າຍຕາຕະລາງ
    const summary = reportData.reduce(
      (acc, curr) => {
        acc.total_technical += curr.attendees.technical;
        acc.total_administrative += curr.attendees.administrative;
        acc.total_attendees += curr.attendees.total;
        acc.total_courses++;

        acc.total_days += curr.duration.total_days;
        acc.total_budget += curr.budget;

        if (curr.location.is_domestic) acc.total_domestic++;
        if (curr.location.is_international) acc.total_international++;

        if (curr.format === 'ONLINE') acc.total_online++;
        if (curr.format === 'ONSITE') acc.total_onsite++;

        return acc;
      },
      {
        total_technical: 0,
        total_administrative: 0,
        total_attendees: 0,
        total_courses: 0,
        total_days: 0, 
        total_domestic: 0, 
        total_international: 0, 
        total_online: 0, 
        total_onsite: 0, 
        total_budget: 0, 
      },
    );

    return {
      report_info: {
        year,
        period_type: type,
        period_value: type === ReportPeriodType.YEARLY ? null : value, // ສະແດງ null ຖ້າເປັນລາຍງານປະຈຳປີ
        report_date: new Date(),
      },
      summary,
      data: reportData,
    };
  }

  // ==========================================
  // HELPER METHOD: ສຳລັບຄຳນວນວັນທີ
  // ==========================================
  private getDateRange(year: number, type: ReportPeriodType, value: number) {
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case ReportPeriodType.MONTHLY:
        if (value < 1 || value > 12)
          throw new BadRequestException('Month must be between 1 and 12');
        startDate = new Date(year, value - 1, 1);
        endDate = new Date(year, value, 0); 
        endDate.setHours(23, 59, 59, 999);
        break;

      case ReportPeriodType.QUARTERLY: {
        if (value < 1 || value > 4)
          throw new BadRequestException('Quarter must be between 1 and 4');
        const startMonthQuarter = (value - 1) * 3;
        startDate = new Date(year, startMonthQuarter, 1);
        endDate = new Date(year, startMonthQuarter + 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case ReportPeriodType.HALF_YEARLY: {
        if (value < 1 || value > 2)
          throw new BadRequestException(
            'Half year must be 1 (first half) or 2 (second half)',
          );
        const startMonthHalf = value === 1 ? 0 : 6;
        startDate = new Date(year, startMonthHalf, 1);
        endDate = new Date(year, startMonthHalf + 6, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      // --------------------------------------------------
      // ເພີ່ມການຄຳນວນສຳລັບລາຍງານປະຈຳປີ (YEARLY)
      // --------------------------------------------------
      case ReportPeriodType.YEARLY: {
        startDate = new Date(year, 0, 1); // ເລີ່ມວັນທີ 1 ມັງກອນ
        endDate = new Date(year, 11, 31); // ສິ້ນສຸດວັນທີ 31 ທັນວາ
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      default:
        throw new BadRequestException('Invalid report period type');
    }

    return { startDate, endDate };
  }
}