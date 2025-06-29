import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateSign } from '../../common/utils/sign.ultis';

import {
  ResponseError,
  ResponseSuccess,
} from 'src/common/responses/http-response';
import { ConfigService } from '@nestjs/config';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { ApiK36Service } from 'src/services/api_k36_service';
import * as moment from 'moment';
import { VerifySignService } from '../verify-sign/verify-sign.service';
import { Game, GameDocument } from '../game/schemas/game.schema';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly api_k36_service: ApiK36Service,
    private readonly verify_sign_service: VerifySignService,

    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
  ) {}

  async loginGame(dto: CustomerLoginDto) {
    try {
      const { site, username, last_ip_login, created_date } = dto;

      let customer = await this.gameModel.findOne({ username });

      if (!customer) {
        customer = new this.gameModel({
          site,
          username,
          ip_login: [
            {
              ip_address: last_ip_login,
              timestamp: Date.now(),
            },
          ],
        });
      } else {
        if (!customer.status) {
          return ResponseError(
            403,
            'Tài khoản đang bị khóa. Vui lòng liên hệ CSKH!',
          );
        }

        customer.ip_login.push({
          ip_address: last_ip_login,
          timestamp: Date.now(),
        });
      }

      await customer.save();

      const timestamp = Math.floor(Date.now() / 1000);
      const secretKey = this.configService.get<string>('SIGN_SECRET_KEY');

      if (!secretKey) {
        this.logger.error('SIGN_SECRET_KEY chưa được khai báo');
        return ResponseError(500, 'Cấu hình hệ thống thiếu SIGN_SECRET_KEY');
      }

      const sign = generateSign(site, username, timestamp, secretKey);

      await this.verify_sign_service.handleSign(
        site,
        username,
        sign,
        timestamp,
        created_date,
      );

      return ResponseSuccess(200, 'Đăng nhập thành công', {
        username,
        sign,
      });
    } catch (error) {
      this.logger.error('Lỗi khi đăng nhập', error.stack);
      return ResponseError(500, 'Có lỗi xảy ra', error.message);
    }
  }

  // async findSettingLotteryCustomer(
  //   site: string,
  //   username: string,
  //   created_date: number,
  // ) {
  //   try {
  //     const [customer, setting] = await Promise.all([
  //       this.customerLotteryModel.findOne({ site, username }).lean(),
  //       this.settingLotteryModel.findOne({ site }).lean(),
  //     ]);

  //     if (!customer)
  //       return ResponseError(404, 'Không tìm thấy thông tin tài khoản');

  //     if (!setting)
  //       return ResponseError(404, 'Không tìm thấy cấu hình sự kiện');

  //     const { start_timestamp, end_timestamp, status, event_code, conditions } =
  //       setting;

  //     let sumDeposit = 0;
  //     let validBet = 0;
  //     if (status) {
  //       const [deposit, betGeneral] = await Promise.all([
  //         this.api_k36_service.getDepositByTimestamp(
  //           site,
  //           username,
  //           start_timestamp,
  //           end_timestamp,
  //         ),
  //         this.api_k36_service.getBetGeneral(
  //           site,
  //           username,
  //           start_timestamp,
  //           end_timestamp,
  //         ),
  //       ]);

  //       if (deposit.status_code !== 200 || betGeneral.status_code !== 200) {
  //         return ResponseError(500, 'Lỗi khi gọi API điều kiện');
  //       }

  //       sumDeposit = deposit.result.data
  //         .filter((item) => item.status === 3 || item.status === 8)
  //         .reduce((sum: number, d: any) => sum + d.depositamt, 0);
  //       validBet = betGeneral.result.summary.validBet;
  //     }

  //     const dataReponse: any[] = [];

  //     for (const condition of conditions) {
  //       const matchedCode = customer.history_code.code_details.find(
  //         (item) =>
  //           item.event_code_detail === condition.code &&
  //           item.event_code === setting.event_code,
  //       );

  //       if (matchedCode) {
  //         dataReponse.push({
  //           event_code_detail: condition.code,
  //           code: matchedCode.code,
  //           name: condition.name,
  //           claimed: 1,
  //         });
  //         continue;
  //       }

  //       let isGive = false;
  //       if (status) {
  //         if (condition.code === 'DANGKY') {
  //           const conditionDate = '2025-07-01';
  //           const timestamp = moment(conditionDate, 'YYYY-MM-DD')
  //             .startOf('day')
  //             .valueOf();
  //           if (created_date >= timestamp) {
  //             isGive = true;
  //           }
  //         } else if (condition.code === 'CHIASE') {
  //           isGive = true;
  //         } else {
  //           isGive =
  //             sumDeposit >= condition.deposit &&
  //             validBet >= condition.valid_bet;
  //         }
  //       }

  //       dataReponse.push({
  //         event_code_detail: condition.code,
  //         code: null,
  //         name: condition.name,
  //         claimed: isGive ? 2 : 0,
  //       });
  //     }

  //     const result = {
  //       data: dataReponse,
  //       streak: customer.history_code.streak_code || 0,
  //     };

  //     return ResponseSuccess(200, 'Thông tin tài khoản thành công', result);
  //   } catch (error) {
  //     this.logger.error(`Lỗi lấy thông tin: ${error.message}`, error.stack);
  //     return ResponseError(500, 'Có lỗi xảy ra khi lấy thông tin tài khoản');
  //   }
  // }

  // async takeCodeLottery(
  //   site: string,
  //   username: string,
  //   event_code_detail: string,
  //   created_date: number,
  //   share_links?: string[],
  // ) {
  //   try {
  //     const [customer, setting] = await Promise.all([
  //       this.customerLotteryModel.findOne({ site, username }).lean(),
  //       this.settingLotteryModel.findOne({ site, status: true }).lean(),
  //     ]);
  //     if (!customer)
  //       return ResponseError(404, 'Không tìm thấy thông tin tài khoản');

  //     if (!setting)
  //       return ResponseError(404, 'Không tìm thấy cấu hình sự kiện');

  //     const { start_timestamp, end_timestamp, status, event_code, conditions } =
  //       setting;

  //     const now = Date.now();
  //     if (now < start_timestamp || now > end_timestamp || !status) {
  //       return ResponseError(404, 'Sự kiện đã kết thúc');
  //     }

  //     const conditions_event_code = conditions.find(
  //       (item) => item.code === event_code_detail,
  //     );

  //     if (!conditions_event_code) {
  //       return ResponseError(404, 'Không tìm thấy thông tin nhiệm vụ');
  //     }

  //     const matchedCode = customer.history_code.code_details.some(
  //       (item) =>
  //         item.event_code === setting.event_code &&
  //         item.event_code_detail === conditions_event_code.code,
  //     );

  //     if (matchedCode) {
  //       return ResponseError(400, 'Bạn đã nhận mã nhiệm vụ này trước đó');
  //     }

  //     let codeList: string[] = [];
  //     if (conditions_event_code.code === 'DANGKY') {
  //       const conditionDate = '2025-07-01';
  //       const timestamp = moment(conditionDate, 'YYYY-MM-DD')
  //         .startOf('day')
  //         .valueOf();
  //       if (created_date < timestamp) {
  //         return ResponseError(400, `Bạn chưa đủ điều kiện nhận mã.`);
  //       }

  //       const count_code = conditions_event_code.code_count;
  //       codeList = await this.generateUniqueCodes(count_code);

  //       await this.insertCustomerLotteryCode(
  //         site,
  //         username,
  //         event_code,
  //         conditions_event_code.code,
  //         conditions_event_code.type_code,
  //         codeList,
  //       );
  //     } else if (conditions_event_code.code === 'CHIASE') {
  //       if (!share_links || share_links.length < 4) {
  //         return ResponseError(400, `Bạn chưa đủ điều kiện nhận mã.`);
  //       }

  //       const count_code = conditions_event_code.code_count;
  //       codeList = await this.generateUniqueCodes(count_code);

  //       await this.insertCustomerLotteryCode(
  //         site,
  //         username,
  //         event_code,
  //         conditions_event_code.code,
  //         conditions_event_code.type_code,
  //         codeList,
  //         share_links,
  //       );
  //     } else if (
  //       conditions_event_code.valid_bet > 0 &&
  //       conditions_event_code.deposit > 0
  //     ) {
  //       const [deposit, betGeneral] = await Promise.all([
  //         this.api_k36_service.getDepositByTimestamp(
  //           site,
  //           username,
  //           start_timestamp,
  //           end_timestamp,
  //         ),
  //         this.api_k36_service.getBetGeneral(
  //           site,
  //           username,
  //           start_timestamp,
  //           end_timestamp,
  //         ),
  //       ]);

  //       if (deposit.status_code !== 200 || betGeneral.status_code !== 200) {
  //         return ResponseError(500, 'Lỗi khi kiểm tra điều kiện điều kiện');
  //       }
  //       const sumDeposit = deposit.result.data
  //         .filter((item) => item.status === 3 || item.status === 8)
  //         .reduce((sum: number, d: any) => sum + d.depositamt, 0);

  //       const validBet = betGeneral.result.summary.validBet;
  //       if (
  //         sumDeposit < conditions_event_code.deposit ||
  //         validBet < conditions_event_code.valid_bet
  //       ) {
  //         return ResponseError(400, `Bạn chưa đủ điều kiện nhận mã.`);
  //       }

  //       const count_code = conditions_event_code.code_count;
  //       codeList = await this.generateUniqueCodes(count_code);

  //       await this.insertCustomerLotteryCode(
  //         site,
  //         username,
  //         event_code,
  //         conditions_event_code.code,
  //         conditions_event_code.type_code,
  //         codeList,
  //       );
  //     } else if (
  //       conditions_event_code.valid_bet > 0 &&
  //       conditions_event_code.deposit === 0
  //     ) {
  //       const betGeneral = await this.api_k36_service.getBetGeneral(
  //         site,
  //         username,
  //         start_timestamp,
  //         end_timestamp,
  //       );

  //       if (betGeneral.status_code !== 200) {
  //         return ResponseError(500, 'Lỗi khi kiểm tra điều kiện điều kiện');
  //       }

  //       const validBet = betGeneral.result.summary.validBet;
  //       if (validBet < conditions_event_code.valid_bet) {
  //         return ResponseError(400, `Bạn chưa đủ điều kiện nhận mã.`);
  //       }

  //       const count_code = conditions_event_code.code_count;
  //       codeList = await this.generateUniqueCodes(count_code);

  //       await this.insertCustomerLotteryCode(
  //         site,
  //         username,
  //         event_code,
  //         conditions_event_code.code,
  //         conditions_event_code.type_code,
  //         codeList,
  //       );
  //     } else if (
  //       conditions_event_code.valid_bet === 0 &&
  //       conditions_event_code.deposit > 0
  //     ) {
  //       const deposit = await this.api_k36_service.getDepositByTimestamp(
  //         site,
  //         username,
  //         start_timestamp,
  //         end_timestamp,
  //       );

  //       if (deposit.status_code !== 200) {
  //         return ResponseError(500, 'Lỗi khi kiểm tra điều kiện điều kiện');
  //       }

  //       const sumDeposit = deposit.result.data
  //         .filter((item) => item.status === 3 || item.status === 8)
  //         .reduce((sum: number, d: any) => sum + d.depositamt, 0);

  //       if (sumDeposit < conditions_event_code.deposit) {
  //         return ResponseError(400, `Bạn chưa đủ điều kiện nhận mã.`);
  //       }

  //       const count_code = conditions_event_code.code_count;
  //       codeList = await this.generateUniqueCodes(count_code);

  //       await this.insertCustomerLotteryCode(
  //         site,
  //         username,
  //         event_code,
  //         conditions_event_code.code,
  //         conditions_event_code.type_code,
  //         codeList,
  //       );
  //     }

  //     const subject = `Gửi mã may mắn tham gia sự kiện ${event_code}`;
  //     const content = `Chúc mừng bạn đã nhận được mã may mắn tham gia sự kiện MEGALIVE. MÃ của bạn là ${codeList.join(', ')}`;
  //     // await this.api_k36_service.sendMessage(site, username, subject, content);

  //     return ResponseSuccess(200, 'Nhận mã dự thưởng thành công', codeList);
  //   } catch (error) {
  //     this.logger.error(`Lỗi lấy thông tin: ${error.message}`, error.stack);
  //     return ResponseError(500, 'Có lỗi xảy ra khi nhận mã dự thưởng');
  //   }
  // }

  // async tradeCodeWithStreak(site: string, username: string) {
  //   try {
  //     const customer = await this.customerLotteryModel.findOne({ username });

  //     if (!customer) {
  //       return ResponseError(404, 'Không tìm thấy tài khoản');
  //     }

  //     if (customer.history_code.streak_code < 5) {
  //       return ResponseError(400, 'Bạn chưa đủ điều kiện để đổi Giftcode');
  //     }

  //     const timeEndCode = Date.now() + 24 * 60 * 60 * 1000;
  //     const randomPoint = Math.floor(Math.random() * (138 - 78 + 1)) + 78;

  //     const createCode = await this.api_k36_service.createFreeCode(
  //       site,
  //       timeEndCode,
  //       'EVENT_MA_MAY_MAN',
  //       '78WIN_MA_MAY_MAN',
  //       1,
  //       randomPoint,
  //       username,
  //     );

  //     if (createCode.status_code !== 200) {
  //       this.logger.error(
  //         `Lỗi tạo code mã dự thưởng: ${username} - ${site} - ${createCode.message}`,
  //       );
  //       return ResponseError(500, 'Có lỗi khi tạo CODE. Vui lòng liên hệ CSKH');
  //     }
  //     const dataGiftcode = {
  //       giftcode: createCode.data.promo_code || 'ERROR_CODE',
  //       traded_at: Date.now(),
  //     };

  //     const updated = await this.customerLotteryModel
  //       .findOneAndUpdate(
  //         { site, username },
  //         {
  //           $inc: { 'history_code.streak_code': -5 },
  //           $push: { 'history_code.giftcode_trade': dataGiftcode },
  //         },
  //         { new: true },
  //       )
  //       .lean();

  //     return ResponseSuccess(
  //       200,
  //       'Đổi Giftcode thành công. Giftcode có thời hạn sử dụng trong vòng 24 giờ.',
  //       {
  //         streak: updated?.history_code?.streak_code || 0,
  //         giftcode: dataGiftcode.giftcode,
  //       },
  //     );
  //   } catch (error) {
  //     this.logger.error('Lỗi khi đổi GiftCode', error.stack);
  //     return ResponseError(500, 'Có lỗi xảy ra', error.message);
  //   }
  // }

  // async historyTakeCodeLottery(site: string, username: string) {
  //   try {
  //     const customer = await this.customerLotteryModel
  //       .findOne({ site, username })
  //       .select(
  //         '-_id history_code.total_code history_code.giftcode_trade history_code.code_details',
  //       )
  //       .lean();

  //     if (!customer)
  //       return ResponseError(404, 'Không tìm thấy thông tin tài khoản');

  //     const { history_code } = customer;
  //     const handleCodeDetails =
  //       customer.history_code.code_details?.map((code) => ({
  //         event_code_detail: code.event_code_detail,
  //         code: code.code,
  //         claimed_at: code.claimed_at,
  //       })) || [];

  //     return ResponseSuccess(200, 'Thông tin tài khoản thành công', {
  //       total_code: history_code.total_code,
  //       giftcode_trade: history_code.giftcode_trade,
  //       code_details: handleCodeDetails,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Lỗi lấy thông tin: ${error.message}`, error.stack);
  //     return ResponseError(500, 'Có lỗi xảy ra khi lấy thông tin tài khoản');
  //   }
  // }

  // private async generateUniqueCodes(count: number) {
  //   const codes = new Set<string>();

  //   while (codes.size < count) {
  //     const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  //     const exists = await this.customerLotteryModel.exists({
  //       'history_code.code_details.code': code,
  //     });

  //     if (!exists) {
  //       codes.add(code);
  //     }
  //   }

  //   return [...codes];
  // }

  // private async insertCustomerLotteryCode(
  //   site: string,
  //   username: string,
  //   event_code: string,
  //   event_code_detail: string,
  //   type_code: number[],
  //   code: string[],
  //   share_links?: string[],
  // ) {
  //   const claimed_at = Date.now();
  //   let handleUpdate = {
  //     $push: {
  //       'history_code.code_details': {
  //         event_code,
  //         event_code_detail,
  //         code,
  //         type_code,
  //         claimed_at,
  //       },
  //     },
  //     $inc: {
  //       'history_code.total_code': code.length,
  //       'history_code.streak_code': code.length,
  //     },
  //   };

  //   if (share_links && share_links.length >= 4) {
  //     handleUpdate.$push['history_code.share_links'] = { $each: share_links };
  //   }

  //   return await this.customerLotteryModel.updateOne(
  //     { site, username },
  //     handleUpdate,
  //   );
  // }
}
