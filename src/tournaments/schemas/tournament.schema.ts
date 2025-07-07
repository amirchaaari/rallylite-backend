import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sport: 'padel' | 'tennis';

  @Prop({ required: true })
  numberOfPlayers: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  level: 'Beginner' | 'Intermediate' | 'Advanced';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  players: Types.ObjectId[];

  @Prop({ type: Object, default: null })
  bracket: any; // can be null or a simple knockout bracket later
}

export type TournamentDocument = Tournament & Document;
export const TournamentSchema = SchemaFactory.createForClass(Tournament);
