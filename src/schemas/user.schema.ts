import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true, unique: true })
  email!: string

  @Prop({ required: true })
  password!: string

  @Prop({ default: false })
  confirmed!: boolean

  @Prop({ type: String, required: false })
  confirmedKey?: string | null

  @Prop({ type: String, required: false })
  recoveryToken?: string | null

  @Prop()
  avatar?: string

  @Prop({ type: Date, default: Date.now })
  date!: Date

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role!: string
}

export const UserSchema = SchemaFactory.createForClass(User)

// Add custom methods
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.confirmedKey
  delete obj.recoveryToken
  return obj
}
