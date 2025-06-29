import { Module } from '@nestjs/common';
import { IncorrectBankAccountService } from './incorrect-bank-account.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IncorrectBankAccount,
  IncorrectBankAccountSchema,
} from './schemas/incorrect-bank-account.schema';

@Module({
  providers: [IncorrectBankAccountService],
  imports: [
    MongooseModule.forFeature([
      { name: IncorrectBankAccount.name, schema: IncorrectBankAccountSchema },
    ]),
  ],
  exports: [IncorrectBankAccountService],
})
export class IncorrectBankAccountModule {}
