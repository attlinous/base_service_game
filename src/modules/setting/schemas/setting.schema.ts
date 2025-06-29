import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false, versionKey: false })
class Condition {
  @Prop({ default: null })
  code: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: 0 })
  deposit: number;

  @Prop({ default: 0 })
  valid_bet: number;

  @Prop({ default: 0 })
  code_count: number;

  @Prop({ type: [Number], default: [] })
  type_code: number[];
}
const ConditionSchema = SchemaFactory.createForClass(Condition);

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true, versionKey: false })
export class Setting {
  @Prop({ required: true, unique: true })
  site: string;

  @Prop({ required: true, unique: true })
  event_code: string;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: 0 })
  start_timestamp: number;

  @Prop({ default: 0 })
  end_timestamp: number;

  @Prop({ type: [ConditionSchema], default: () => [] })
  conditions: Condition[];
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
