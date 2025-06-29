import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerifySignService } from './verify-sign.service';
import { VerifySign, VerifySignSchema } from './schemas/verify-sign.schema';

@Module({
  providers: [VerifySignService],
  imports: [
    MongooseModule.forFeature([
      { name: VerifySign.name, schema: VerifySignSchema },
    ]),
  ],
  exports: [VerifySignService],
})
export class VerifySignModule {}
