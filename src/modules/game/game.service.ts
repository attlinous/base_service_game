import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetAllDataDto } from './dto/getall-data.dto';
import {
  ResponseError,
  ResponseSuccess,
} from 'src/common/responses/http-response';
import { Game, GameDocument } from './schemas/game.schema';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectModel(Game.name)
    private readonly customerModel: Model<GameDocument>,
  ) {}

  async findAll(query: GetAllDataDto) {
    try {
      const { page = 1, pageSize = 10, site, username } = query;

      const skip = (page - 1) * pageSize;
      const filter: any = { site };

      if (username) filter.username = { $regex: username, $options: 'i' };

      const [items, total] = await Promise.all([
        this.customerModel
          .find(filter)
          .select('username site history_code.total_code status')
          .skip(skip)
          .limit(pageSize)
          .lean(),
        this.customerModel.countDocuments(filter),
      ]);

      return ResponseSuccess(200, 'Lấy danh sách khách thành công', {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy danh sách khách: ${error.message}`,
        error.stack,
      );
      return ResponseError(500, 'Có lỗi xảy ra', error.message);
    }
  }

  async getCustomerDetailById(id: string) {
    try {
      const customer = await this.customerModel.findById(id).lean();

      if (!customer) {
        return ResponseError(404, 'Không tìm thấy thông tin tài khoản');
      }

      customer.ip_login = customer.ip_login
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      return ResponseSuccess(
        200,
        'Lấy thông tin chi tiết khách thành công',
        customer,
      );
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy thông tin khách: ${error.message}`,
        error.stack,
      );
      return ResponseError(500, 'Đã xảy ra lỗi khi lấy chi tiết tài khoản');
    }
  }

  async updateStatus(id: string) {
    try {
      const customer = await this.customerModel.findById(id);
      if (!customer) {
        return ResponseError(404, 'Người dùng không tồn tại');
      }

      const updated = await this.customerModel.findByIdAndUpdate(
        id,
        { status: !customer.status },
        { new: true },
      );

      return ResponseSuccess(
        200,
        'Cập nhật trạng thái thành công',
        updated?.status,
      );
    } catch (error) {
      this.logger.error(
        `Lỗi khi cập nhật trạng thái khách hàng ${id}: ${error.message}`,
        error.stack,
      );
      return ResponseError(500, 'Có lỗi xảy ra', error.message);
    }
  }

  async getDataByTypeCode(site: string, type_code: number) {
    try {
      const customers = await this.customerModel
        .find({
          site,
          'history_code.code_details.type_code': { $in: [type_code] },
        })
        .lean();
      if (!customers) {
        return null;
      }

      const results: any[] = [];

      for (const customer of customers) {
        const matchedCodes = customer.history_code?.code_details?.filter(
          (detail) => detail.type_code.includes(type_code),
        );

        if (matchedCodes?.length) {
          results.push({
            username: customer.username,
            codes: matchedCodes.map((d) => ({
              event_code_detail: d.event_code_detail,
              code: d.code,
              claimed_at: d.claimed_at,
            })),
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Lỗi khi danh sách dữ liệu ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
