import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { VerifySignService } from 'src/modules/verify-sign/verify-sign.service';

@Injectable()
export class VerifySignMiddleware implements NestMiddleware {
  private readonly logger = new Logger(VerifySignMiddleware.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly verify_sign_service: VerifySignService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const sign = (req.headers['x-sign-key'] || '').toString().trim();

      if (!sign) {
        return res.status(401).json({
          status_code: 401,
          message: 'Thiếu thông tin xác thực',
        });
      }

      const verify = await this.verify_sign_service.findSign(sign);

      if (!verify || !verify.sign || !verify.timestamp) {
        return res.status(401).json({
          status_code: 401,
          message: 'Không tìm thấy thông tin xác thực',
        });
      }

      const now = Math.floor(Date.now() / 1000);
      const expiredSeconds =
        this.configService.get<number>('SIGN_EXPIRED_SECONDS') || 1800;

      if (now - verify.timestamp > expiredSeconds) {
        return res.status(401).json({
          status_code: 401,
          message: 'Phiên đăng nhập đã hết hạn',
        });
      }

      if (verify.sign !== sign) {
        return res.status(401).json({
          status_code: 401,
          message: 'Phiên đăng nhập không hợp lệ',
        });
      }

      (req as any).site = verify.site.toLowerCase().trim();
      (req as any).username = verify.username.toLowerCase().trim();
      (req as any).create_date = verify.created_date;

      next();
    } catch (error) {
      this.logger.error(`Lỗi xác thực: ${error.message}`, error.stack);
      return res.status(500).json({
        status_code: 500,
        message: 'Lỗi hệ thống khi xác thực chữ ký',
      });
    }
  }
}
