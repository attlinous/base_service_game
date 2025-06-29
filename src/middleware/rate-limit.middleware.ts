import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const limiterAttenDace = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: {
    status_code: 429,
    message: 'Thao tác quá nhiều lần, vui lòng thử lại sau 1 phút',
  },
  keyGenerator: (req: Request) => {
    const username = req.body?.username;
    return `${username ?? req.ip}_attendace`;
  },
});

@Injectable()
export class RateLimitAttenDanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    limiterAttenDace(req, res, next);
  }
}

const limiterLottery = rateLimit({
  windowMs: 5 * 1000,
  max: 1,
  message: {
    status_code: 429,
    message: 'Thao tác quá nhiều lần, vui lòng thử lại sau 5 giây',
  },
  keyGenerator: (req: Request) => {
    const username = req.body?.username;
    return `${username ?? req.ip}_lottery`;
  },
});

@Injectable()
export class RateLimitLotteryMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    limiterLottery(req, res, next);
  }
}
