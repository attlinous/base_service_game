import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingDto } from './dto/setting.dto';
import { ConfigService } from '@nestjs/config';
import {
  ResponseError,
  ResponseSuccess,
} from 'src/common/responses/http-response';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name);

  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const site = this.configService.get<string>('SITE');
    const existing = await this.settingModel.findOne({ site });

    if (!existing) {
      await this.settingModel.create({
        site,
        event_code: 'DUATOP_QUAYSO_01',
      });
      this.logger.log(`Khởi tạo setting game cho site: ${site}`);
    } else {
      this.logger.log(`Setting game đã tồn tại cho site: ${site}`);
    }
  }

  async update(dto: SettingDto) {
    try {
      const updated = await this.settingModel.findOneAndUpdate(
        { site: dto.site },
        { $set: dto },
        { new: true },
      );

      if (!updated) {
        return ResponseError(404, 'Không tìm thấy thông tin cấu hình');
      }

      return ResponseSuccess(200, 'Cập nhật thành công', updated);
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật cấu hình', error.stack);
      return ResponseError(500, 'Đã xảy ra lỗi khi cập nhật cấu hình');
    }
  }

  async findSetting(site: string) {
    try {
      const setting = await this.settingModel.findOne({ site }).lean();

      if (!setting) {
        return ResponseError(404, 'Không tìm thấy thông tin cấu hình');
      }

      return ResponseSuccess(200, 'Lấy thông tin cấu hình', setting);
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy thông tin cấu hình: ${error.message}`,
        error.stack,
      );
      return ResponseError(500, 'Đã xảy ra lỗi khi lấy thông tin cấu hình');
    }
  }
}
