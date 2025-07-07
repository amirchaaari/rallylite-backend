import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true })
  sport: 'padel' | 'tennis';

  @Prop({ required: true })
  matchType: 'singles' | 'doubles';

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  maxPlayers: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  players: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  // 👇 New field for join requests
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  joinRequests: Types.ObjectId[];
}

export type MatchDocument = Match & Document;
export const MatchSchema = SchemaFactory.createForClass(Match);
