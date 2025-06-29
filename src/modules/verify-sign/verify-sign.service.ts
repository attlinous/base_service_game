import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VerifySign, VerifySignDocument } from './schemas/verify-sign.schema';

@Injectable()
export class VerifySignService {
  private readonly logger = new Logger(VerifySignService.name);
  constructor(
    @InjectModel(VerifySign.name)
    private readonly verifySignModel: Model<VerifySignDocument>,
  ) {}

  async findSign(sign: string) {
    return await this.verifySignModel.findOne({ sign }).lean();
  }

  async handleSign(
    site: string,
    username: string,
    sign: string,
    timestamp: number,
    created_date: number,
  ) {
    try {
      await this.verifySignModel.updateOne(
        { site, username },
        {
          $set: {
            sign,
            timestamp: timestamp,
            created_date,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      this.logger.error(`Lỗi khi tạo sign: ${error.message}`, error.stack);
    }
  }
}
