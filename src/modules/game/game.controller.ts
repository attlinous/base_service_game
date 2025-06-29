import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as ExcelJS from 'exceljs';
import { GameService } from './game.service';
import { GetAllDataDto } from './dto/getall-data.dto';

@ApiTags('Customer Lottery')
@ApiBearerAuth('TOKEN')
@Controller('customer-lottery')
export class GameController {
  constructor(private readonly customerService: GameService) {}

  @Get()
  async findAll(@Query() query: GetAllDataDto) {
    return await this.customerService.findAll(query);
  }

  @Patch('update-status/:id')
  @ApiParam({ name: 'id', type: String })
  async updateStatus(@Param('id') id: string) {
    return await this.customerService.updateStatus(id);
  }

  @Get('customer-detail/:id')
  @ApiParam({ name: 'id', type: String })
  async customer_detail(@Param('id') id: string) {
    return await this.customerService.getCustomerDetailById(id);
  }

  @Post('download-data')
  async download_data(@Query('site') site: string, @Res() res: Response) {
    try {
      const [data_type_1, data_type_2, data_type_3] = await Promise.all([
        this.customerService.getDataByTypeCode(site, 1),
        this.customerService.getDataByTypeCode(site, 2),
        this.customerService.getDataByTypeCode(site, 3),
      ]);

      const workbook = new ExcelJS.Workbook();

      const columns = [
        { header: 'Tài khoản', key: 'username', width: 30 },
        { header: 'Loại nhiệm vụ', key: 'event_code_detail', width: 30 },
        { header: 'Mã may mắn', key: 'code', width: 30 },
        { header: 'Ngày nhận', key: 'claimed_at', width: 30 },
      ];
      const sheet_1 = workbook.addWorksheet('1');
      sheet_1.columns = columns;
      sheet_1.getColumn('code').alignment = { wrapText: true };
      data_type_1?.forEach((item) => {
        item.codes.forEach((code) => {
          sheet_1.addRow({
            username: item.username,
            event_code_detail: code.event_code_detail,
            code: code.code.join('\n'),
            claimed_at: code.claimed_at
              ? new Date(code.claimed_at).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : '',
          });
        });
      });

      const sheet_2 = workbook.addWorksheet('2');
      sheet_2.columns = columns;
      sheet_2.getColumn('code').alignment = { wrapText: true };
      data_type_2?.forEach((item) => {
        item.codes.forEach((code) => {
          sheet_2.addRow({
            username: item.username,
            event_code_detail: code.event_code_detail,
            code: code.code.join('\n'),
            claimed_at: code.claimed_at
              ? new Date(code.claimed_at).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : '',
          });
        });
      });

      const sheet_3 = workbook.addWorksheet('3');
      sheet_3.columns = columns;
      sheet_3.getColumn('code').alignment = { wrapText: true };
      data_type_3?.forEach((item) => {
        item.codes.forEach((code) => {
          sheet_3.addRow({
            username: item.username,
            event_code_detail: code.event_code_detail,
            code: code.code.join('\n'),
            claimed_at: code.claimed_at
              ? new Date(code.claimed_at).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : '',
          });
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=ma_du_thuong${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error('Error exporting race top:', err);
      return res.status(500).json({
        statusCode: 500,
        valid: false,
        message: err.message,
      });
    }
  }
}
