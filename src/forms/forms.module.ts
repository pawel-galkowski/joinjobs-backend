import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FormsService } from './forms.service'
import { FormsController } from './forms.controller'
import { Form, FormSchema } from '../schemas/form.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }])],
  providers: [FormsService],
  controllers: [FormsController],
  exports: [FormsService]
})
export class FormsModule {}
