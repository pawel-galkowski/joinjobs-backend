import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Form } from '../schemas/form.schema'
import { CreateFormDto, UpdateFormDto, SubmitFormResponseDto } from './dto/form.dto'

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Form.name) private readonly formModel: Model<Form>
  ) {}

  async getAllForms() {
    try {
      const forms = await this.formModel.find().populate('user', ['name', 'avatar']).sort({ date: -1 })
      return forms
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to fetch forms')
    }
  }

  async getFormsByCompany(company: string) {
    try {
      const forms = await this.formModel.find({ company }).populate('user', ['name', 'avatar']).sort({ date: -1 })
      return forms
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to fetch forms')
    }
  }

  async getFormById(formId: string) {
    try {
      const form = await this.formModel.findById(formId).populate('user', ['name', 'avatar'])
      if (!form) {
        throw new NotFoundException('Form not found')
      }
      return form
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to fetch form')
    }
  }

  async getUserForms(userId: string) {
    try {
      const forms = await this.formModel.find({ user: userId }).sort({ date: -1 })
      return forms
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to fetch user forms')
    }
  }

  async createForm(userId: string, createFormDto: CreateFormDto) {
    try {
      const form = new this.formModel({
        ...createFormDto,
        user: userId
      })

      await form.save()
      return form.populate('user', ['name', 'avatar'])
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to create form')
    }
  }

  async updateForm(userId: string, formId: string, updateFormDto: UpdateFormDto) {
    try {
      const form = await this.formModel.findById(formId)
      if (!form) {
        throw new NotFoundException('Form not found')
      }

      if (form.user.toString() !== userId) {
        throw new BadRequestException('Not authorized to update this form')
      }

      Object.assign(form, updateFormDto)
      await form.save()
      return form
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to update form')
    }
  }

  async deleteForm(userId: string, formId: string) {
    try {
      const form = await this.formModel.findById(formId)
      if (!form) {
        throw new NotFoundException('Form not found')
      }

      if (form.user.toString() !== userId) {
        throw new BadRequestException('Not authorized to delete this form')
      }

      await this.formModel.findByIdAndDelete(formId)
      return { message: 'Form deleted successfully' }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete form')
    }
  }

  async submitFormResponse(formId: string, responseData: SubmitFormResponseDto) {
    try {
      const form = await this.formModel.findById(formId)
      if (!form) {
        throw new NotFoundException('Form not found')
      }

      // Note: Form responses will be stored in a separate collection in future updates
      // For now, we'll just increment the response count
      form.responses.push(formId as any)
      await form.save()

      return { message: 'Form response submitted successfully' }
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to submit form response')
    }
  }
}
