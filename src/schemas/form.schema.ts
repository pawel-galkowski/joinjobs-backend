import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type FormDocument = Form & Document

@Schema()
class FormField {
  @Prop({ required: true })
  label!: string

  @Prop({ required: true })
  type!: string

  @Prop({ default: false })
  required!: boolean

  @Prop({ type: [String] })
  options?: string[]
}

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true })
  name!: string

  @Prop()
  description?: string

  @Prop({ required: true })
  company!: string

  @Prop({ type: [FormField], default: [] })
  fields!: FormField[]

  @Prop({ type: [Types.ObjectId], ref: 'FormResponse', default: [] })
  responses!: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId

  @Prop({ type: Date, default: Date.now })
  date!: Date
}

export const FormSchema = SchemaFactory.createForClass(Form)
