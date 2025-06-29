// import {
//   Injectable,
//   NestMiddleware,
//   ForbiddenException,
//   Logger,
// } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   IpWhitelist,
//   IpWhitelistDocument,
// } from '../modules/ips_whitelist/schemas/ip_whitelist';

// @Injectable()
// export class CheckIpMiddleware implements NestMiddleware {
//   private readonly logger = new Logger(CheckIpMiddleware.name);

//   constructor(
//     @InjectModel(IpWhitelist.name)
//     private readonly whitelistModel: Model<IpWhitelistDocument>,
//   ) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const rawIp = req.ip || req.connection.remoteAddress || '';
//     const ip = rawIp.replace('::ffff:', '');

//     try {
//       const exists = await this.whitelistModel.exists({ ip });

//       if (!exists) {
//         throw new ForbiddenException(`IP ${ip} không nằm trong whitelist`);
//       }

//       next();
//     } catch (error) {
//       this.logger.error(`Lỗi kiểm tra IP: ${ip}`, error.stack);
//       throw new ForbiddenException(`IP ${ip} không nằm trong whitelist`);
//     }
//   }
// }
