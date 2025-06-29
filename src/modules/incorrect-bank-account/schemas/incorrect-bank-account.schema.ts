import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IncorrectBankAccountDocument = IncorrectBankAccount & Document;

@Schema({ timestamps: true })
export class IncorrectBankAccount {
  @Prop({ required: true, unique: true })
  account: string;

  @Prop({ required: true })
  site: string;

  @Prop({ default: 0 })
  failed_attempts: number;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: null })
  blockedAt: Date;
}

export const IncorrectBankAccountSchema =
  SchemaFactory.createForClass(IncorrectBankAccount);

IncorrectBankAccountSchema.index({ blockedAt: 1 }, { expireAfterSeconds: 300 });
