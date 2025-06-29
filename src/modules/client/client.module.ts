import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { HttpModule } from '@nestjs/axios';
import { IncorrectBankAccountModule } from '../incorrect-bank-account/incorrect-bank-account.module';
import { ApiK36Service } from 'src/services/api_k36_service';
// import {
//   CheckInfoMemberAttenDanceMiddleware,
//   CheckInfoMemberLotteryMiddleware,
// } from 'src/middleware/check-info-member.middleware';
import { VerifySignMiddleware } from 'src/middleware/verify-sign.middleware';
import {
  RateLimitAttenDanceMiddleware,
  RateLimitLotteryMiddleware,
} from 'src/middleware/rate-limit.middleware';
import { VerifySignModule } from '../verify-sign/verify-sign.module';
import { Game, GameSchema } from '../game/schemas/game.schema';

@Module({
  providers: [ClientService, ApiK36Service],
  controllers: [ClientController],
  imports: [
    HttpModule,
    IncorrectBankAccountModule,
    VerifySignModule,
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
})
export class ClientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitAttenDanceMiddleware)
      .forRoutes(
        { path: 'client/customer-checkin', method: RequestMethod.POST },
        { path: 'client/reward-gift-streak', method: RequestMethod.POST },
        { path: 'client/customer-history-checkin', method: RequestMethod.GET },
        { path: 'client/find-setting', method: RequestMethod.GET },
      );
    consumer.apply(RateLimitLotteryMiddleware).forRoutes(
      {
        path: 'client/lottery/give-code',
        method: RequestMethod.POST,
      },
      {
        path: 'client/lottery/trade-giftcode',
        method: RequestMethod.POST,
      },
    );
    // consumer.apply(CheckInfoMemberAttenDanceMiddleware).forRoutes({
    //   path: 'client/customer-login',
    //   method: RequestMethod.POST,
    // });
    // consumer.apply(CheckInfoMemberLotteryMiddleware).forRoutes({
    //   path: 'client/lottery/customer-login',
    //   method: RequestMethod.POST,
    // });
    consumer.apply(VerifySignMiddleware).forRoutes(
      {
        path: 'client/customer-checkin',
        method: RequestMethod.POST,
      },
      {
        path: 'client/reward-gift-streak',
        method: RequestMethod.POST,
      },
      {
        path: 'client/customer-history-checkin',
        method: RequestMethod.GET,
      },
      {
        path: 'client/find-setting',
        method: RequestMethod.GET,
      },
      {
        path: 'client/lottery/customer-info',
        method: RequestMethod.GET,
      },
      {
        path: 'client/lottery/take-code',
        method: RequestMethod.POST,
      },
      {
        path: 'client/lottery/trade-giftcode',
        method: RequestMethod.POST,
      },
      {
        path: 'client/lottery/history-take-code',
        method: RequestMethod.GET,
      },
    );
  }
}
