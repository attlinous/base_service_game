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
}
