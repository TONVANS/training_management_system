// src/reports/reports.controller.ts
import { Controller, Get, Query, ParseIntPipe, ParseEnumPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ReportsService, ReportPeriodType } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('training')
  @Roles(Role.ADMIN) // ສະເພາະ Admin ເບິ່ງໄດ້
  @ApiOperation({ 
    summary: 'ດຶງຂໍ້ມູນລາຍງານການຝຶກອົບຮົມ (ປະຈຳເດືອນ, ໄຕມາດ, 6 ເດືອນ, ປະຈຳປີ)',
    description: 'ໃຊ້ສຳລັບດຶງຂໍ້ມູນໄປສະແດງໃນຕາຕະລາງລາຍງານ PDF'
  })
  @ApiQuery({ name: 'year', type: Number, description: 'ປີ (ເຊັ່ນ: 2026)' })
  @ApiQuery({ name: 'type', enum: ReportPeriodType, description: 'ປະເພດລາຍງານ' })
  @ApiQuery({ 
    name: 'value', 
    type: Number, 
    required: false, // ສຳລັບລາຍງານປະຈຳປີ ບໍ່ຈຳເປັນຕ້ອງສົ່ງຄ່ານີ້
    description: 'ຄ່າຂອງປະເພດ (ຖ້າເປັນເດືອນ: 1-12, ໄຕມາດ: 1-4, ເຄິ່ງປີ: 1-2, ປະຈຳປີ: ບໍ່ຕ້ອງໃສ່)' 
  })
  @ApiResponse({ status: 200, description: 'ດຶງຂໍ້ມູນລາຍງານສຳເລັດ' })
  async getTrainingReport(
    @Query('year', ParseIntPipe) year: number,
    @Query('type', new ParseEnumPipe(ReportPeriodType)) type: ReportPeriodType,
    @Query('value', new ParseIntPipe({ optional: true })) value?: number, // ເຮັດໃຫ້ເປັນ Optional
  ) {
    // ຖ້າບໍ່ໄດ້ສົ່ງ value ມາ (ເຊັ່ນກໍລະນີ YEARLY) ໃຫ້ກຳນົດຄ່າເລີ່ມຕົ້ນເປັນ 1 ເພື່ອປ້ອງກັນ error
    const periodValue = value || 1; 
    return this.reportsService.getTrainingReport(year, type, periodValue);
  }
}