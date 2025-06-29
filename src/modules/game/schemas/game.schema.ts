import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ _id: false })
export class IpAddressLogin {
  @Prop({ required: true })
  ip_address: string;

  @Prop({ required: true })
  timestamp: number;
}

@Schema({ _id: false })
export class GiftCodeTrade {
  @Prop({ required: true })
  giftcode: string;

  @Prop({ required: true })
  traded_at: number;
}

@Schema({ _id: false })
export class CodeDetail {
  @Prop({ required: true })
  event_code: string;

  @Prop({ required: true })
  event_code_detail: string;

  @Prop({ required: true })
  code: string[];

  @Prop({ required: true })
  type_code: number[];

  @Prop({ required: true })
  claimed_at: number;
}

@Schema({ _id: false })
export class HistoryCode {
  @Prop({ default: 0 })
  total_code: number;

  @Prop({ default: 0 })
  streak_code: number;

  @Prop({ type: [GiftCodeTrade], default: [] })
  giftcode_trade: GiftCodeTrade[];

  @Prop({ type: [String], default: [] })
  share_links: string[];

  @Prop({ type: [CodeDetail], default: [] })
  code_details: CodeDetail[];
}

@Schema({ timestamps: true, versionKey: false })
export class Game {
  @Prop({ required: true })
  site: string;

  @Prop({ required: true })
  username: string;

  @Prop({ type: [IpAddressLogin], default: () => [] })
  ip_login: IpAddressLogin[];

  @Prop({ default: true })
  status: boolean;

  @Prop({
    type: HistoryCode,
    default: () => ({ streak_code: 0, code_details: [] }),
  })
  history_code: HistoryCode;
}

export const GameSchema = SchemaFactory.createForClass(Game);
GameSchema.index({ site: 1, username: 1 }, { unique: true });
GameSchema.index({ 'history_code.code_details.code': 1 });
