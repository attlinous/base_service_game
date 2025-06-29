import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VerifySignDocument = VerifySign & Document;

@Schema({ timestamps: true })
export class VerifySign {
  @Prop({ required: true })
  site: string;

  @Prop({ default: 0 })
  userId: number;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 0 })
  created_date: number;

  @Prop({ required: true })
  sign: string;

  @Prop({ required: true })
  timestamp: number;
}

export const VerifySignSchema = SchemaFactory.createForClass(VerifySign);
VerifySignSchema.index({ site: 1, username: 1 }, { unique: true });
VerifySignSchema.index({ sign: 1 });
