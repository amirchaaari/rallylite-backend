import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() sport: 'padel' | 'tennis';
  @Prop() skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  @Prop() city: string;
  @Prop() availability?: string[];
  @Prop({ default: ['player'] }) roles: string[];
@Prop({ default: function () {
  return `https://ui-avatars.com/api/?name=User`;
}})
photoUrl: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
