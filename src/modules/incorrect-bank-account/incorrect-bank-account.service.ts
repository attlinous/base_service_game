import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IncorrectBankAccount,
  IncorrectBankAccountDocument,
} from './schemas/incorrect-bank-account.schema';
import { Model } from 'mongoose';

@Injectable()
export class IncorrectBankAccountService {
  private readonly logger = new Logger(IncorrectBankAccountService.name);
  constructor(
    @InjectModel(IncorrectBankAccount.name)
    private readonly incorrectBankAccountModel: Model<IncorrectBankAccountDocument>,
  ) {}

  async findOneByAccount(site: string, account: string) {
    return await this.incorrectBankAccountModel
      .findOne({ account, site })
      .lean();
  }

  async handleFailedAttempt(site: string, account: string) {
    try {
      const updatedData = await this.incorrectBankAccountModel.findOneAndUpdate(
        { account, site },
        {
          $inc: { failed_attempts: 1 },
          $setOnInsert: {
            isBlocked: false,
            blockedAt: null,
          },
        },
        { new: true, upsert: true },
      );

      if (updatedData.failed_attempts >= 3 && !updatedData.isBlocked) {
        updatedData.isBlocked = true;
        updatedData.blockedAt = new Date();
        await updatedData.save();
      }
    } catch (error) {
      this.logger.error(
        `Lỗi khi cập nhật số lần sai thông tin tài khoản: ${error.message}`,
        error.stack,
      );
    }
  }
}
