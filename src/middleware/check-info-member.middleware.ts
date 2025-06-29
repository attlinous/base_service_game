// import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { IncorrectBankAccountService } from 'src/modules/incorrect-bank-account/incorrect-bank-account.service';
// import { ApiK36Service } from '../services/api_k36_service';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   SettingAttenDance,
//   SettingAttenDanceDocument,
// } from 'src/modules/setting/setting-attendance/schemas/setting-attendance.schema';
// import {
//   SettingLottery,
//   SettingLotteryDocument,
// } from 'src/modules/setting/setting-lottery/schemas/setting-lottery.schema';

// @Injectable()
// export class CheckInfoMemberAttenDanceMiddleware implements NestMiddleware {
//   private readonly logger = new Logger(
//     CheckInfoMemberAttenDanceMiddleware.name,
//   );

//   constructor(
//     private readonly api_k36_service: ApiK36Service,
//     private readonly incorrect_bank_account_service: IncorrectBankAccountService,

//     @InjectModel(SettingAttenDance.name)
//     private readonly settingAttenDanceModel: Model<SettingAttenDanceDocument>,
//   ) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     let { site, username, lastBankNumber } = req.body;

//     if (!site || !username || !lastBankNumber) {
//       return res.status(400).json({
//         status_code: 400,
//         message: 'Thông tin không hợp lệ',
//       });
//     }

//     try {
//       const ip =
//         req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
//         req.ip;
//       username = username.toLowerCase().trim();

//       req.body.username = username;
//       (req as any).ipAddress = ip;

//       const blocked =
//         await this.incorrect_bank_account_service.findOneByAccount(
//           site,
//           username,
//         );
//       if (blocked?.isBlocked) {
//         return res.status(400).json({
//           status_code: 400,
//           message: 'Tài khoản bị khóa do nhập sai quá 3 lần trong 5 phút!',
//         });
//       }

//       this.logger.log(
//         `Kiểm tra thông tin tài khoản ${site} - ${username} - ${lastBankNumber}`,
//       );

//       const info = await this.api_k36_service.getInfoMember(site, username);
//       if (info?.status_code != 200) {
//         this.logger.error(
//           `Lỗi khi gọi API lấy thông tin tài khoản: ${JSON.stringify(info)}`,
//         );
//         return res.status(404).json({
//           status_code: 404,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       const matched = (info.result.banksnameaccount || '')
//         .split(',')
//         .map((s: string) => s.split('-')[1]?.trim())
//         .some((acc: string | undefined) => acc?.slice(-4) === lastBankNumber);

//       if (!matched) {
//         this.logger.error(
//           `Tài khoản ${site} - ${username} - ${lastBankNumber} không khớp thông tin ngân hàng`,
//         );
//         await this.incorrect_bank_account_service.handleFailedAttempt(
//           site,
//           username,
//         );

//         return res.status(404).json({
//           status_code: 404,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       const setting_atendance = await this.settingAttenDanceModel
//         .findOne({ site })
//         .lean();

//       if (!setting_atendance) {
//         this.logger.error(
//           `Không tìm thấy cấu hình điều kiện điểm danh: ${site}`,
//         );
//         return res.status(404).json({
//           status_code: 404,
//           message: 'Có lỗi xảy ra, vui lòng liên hệ CSKH',
//         });
//       }

//       const { level_vip, group_danger } = setting_atendance;

//       if (
//         group_danger.length > 0 &&
//         group_danger.includes(info.result.vgname)
//       ) {
//         this.logger.error(
//           `Tài khoản ${username} thuộc nhóm lạm dụng - Hiện tại ${info.result.vgname}`,
//         );
//         return res.status(500).json({
//           status_code: 500,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       if (level_vip > 0 && info.result.newVipLevel < level_vip) {
//         this.logger.error(
//           `Tài khoản ${username} chưa đủ điều kiện VIP ${level_vip} để tham gia - Hiện tại ${info.result.newVipLevel}`,
//         );
//         return res.status(500).json({
//           status_code: 500,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       next();
//     } catch (error) {
//       this.logger.error('CheckInfoMemberMiddleware Error:', error);
//       return res.status(500).json({
//         status_code: 500,
//         message: 'Đã xảy ra lỗi trong quá trình xử lý',
//       });
//     }
//   }
// }

// @Injectable()
// export class CheckInfoMemberLotteryMiddleware implements NestMiddleware {
//   private readonly logger = new Logger(CheckInfoMemberLotteryMiddleware.name);

//   constructor(
//     private readonly api_k36_service: ApiK36Service,
//     private readonly incorrect_bank_account_service: IncorrectBankAccountService,

//     @InjectModel(SettingLottery.name)
//     private readonly settingLotteryModel: Model<SettingLotteryDocument>,
//   ) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     let { site, username, lastBankNumber } = req.body;

//     if (!site || !username || !lastBankNumber) {
//       return res.status(400).json({
//         status_code: 400,
//         message: 'Thông tin không hợp lệ',
//       });
//     }

//     try {
//       const ip =
//         req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
//         req.ip;
//       username = username.toLowerCase().trim();

//       req.body.username = username;
//       (req as any).ipAddress = ip;

//       const blocked =
//         await this.incorrect_bank_account_service.findOneByAccount(
//           site,
//           username,
//         );
//       if (blocked?.isBlocked) {
//         return res.status(400).json({
//           status_code: 400,
//           message: 'Tài khoản bị khóa do nhập sai quá 3 lần trong 5 phút!',
//         });
//       }

//       this.logger.log(
//         `Kiểm tra thông tin tài khoản ${site} - ${username} - ${lastBankNumber}`,
//       );

//       const info = await this.api_k36_service.getInfoMember(site, username);
//       if (info?.status_code != 200) {
//         this.logger.error(
//           `Lỗi khi gọi API lấy thông tin tài khoản: ${JSON.stringify(info)}`,
//         );
//         return res.status(404).json({
//           status_code: 404,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       const matched = (info.result.banksnameaccount || '')
//         .split(',')
//         .map((s: string) => s.split('-')[1]?.trim())
//         .some((acc: string | undefined) => acc?.slice(-4) === lastBankNumber);

//       if (!matched) {
//         this.logger.error(
//           `Tài khoản ${site} - ${username} - ${lastBankNumber} không khớp thông tin ngân hàng`,
//         );
//         await this.incorrect_bank_account_service.handleFailedAttempt(
//           site,
//           username,
//         );

//         return res.status(404).json({
//           status_code: 404,
//           message: 'Tài khoản không đủ điều kiện tham gia',
//         });
//       }

//       (req as any).create_date = info.result.createdate;

//       next();
//     } catch (error) {
//       this.logger.error('CheckInfoMemberMiddleware Error:', error);
//       return res.status(500).json({
//         status_code: 500,
//         message: 'Đã xảy ra lỗi trong quá trình xử lý',
//       });
//     }
//   }
// }
