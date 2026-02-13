import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PostDocument = Post & Document

@Schema()
class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user?: Types.ObjectId

  @Prop({ required: true })
  text!: string

  @Prop()
  name?: string

  @Prop()
  avatar?: string

  @Prop({ type: Date, default: Date.now })
  date?: Date
}

@Schema()
class Like {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user?: Types.ObjectId
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId

  @Prop({ required: true })
  text!: string

  @Prop()
  name?: string

  @Prop()
  avatar?: string

  @Prop({ type: [Like], default: [] })
  likes!: Like[]

  @Prop({ type: [Comment], default: [] })
  comments!: Comment[]

  @Prop({ type: Date, default: Date.now })
  date?: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)
