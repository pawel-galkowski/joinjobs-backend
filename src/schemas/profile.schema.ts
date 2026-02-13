import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema()
class Experience {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  location?: string;

  @Prop({ required: true })
  company!: string;

  @Prop({ required: true })
  from!: Date;

  @Prop()
  to?: Date;

  @Prop({ default: false })
  current!: boolean;

  @Prop()
  description?: string;
}

@Schema()
class Education {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({ required: true })
  school!: string;

  @Prop({ required: true })
  degree!: string;

  @Prop({ required: true })
  fieldofstudy!: string;

  @Prop({ required: true })
  from!: Date;

  @Prop()
  to?: Date;

  @Prop({ default: false })
  current!: boolean;

  @Prop()
  description?: string;
}

@Schema()
class Social {
  @Prop()
  youtube?: string;

  @Prop()
  twitter?: string;

  @Prop()
  facebook?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  instagram?: string;
}

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop()
  company?: string;

  @Prop()
  website?: string;

  @Prop()
  location?: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: [String], required: true })
  skills!: string[];

  @Prop()
  bio?: string;

  @Prop()
  profileImg?: string;

  @Prop()
  githubusername?: string;

  @Prop({ type: [Experience], default: [] })
  experience!: Experience[];

  @Prop({ type: [Education], default: [] })
  education!: Education[];

  @Prop({ type: Social, default: {} })
  social?: Social;

  @Prop({ type: Date, default: Date.now })
  date?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
