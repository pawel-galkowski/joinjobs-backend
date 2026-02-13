import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { FormsService } from './forms.service'
import { CreateFormDto, UpdateFormDto, SubmitFormResponseDto } from './dto/form.dto'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('api/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  async getAllForms() {
    return this.formsService.getAllForms()
  }

  @Get('company/:company')
  async getFormsByCompany(@Param('company') company: string) {
    return this.formsService.getFormsByCompany(company)
  }

  @Get('my-forms')
  @UseGuards(JwtGuard)
  async getUserForms(@CurrentUser() user: any) {
    return this.formsService.getUserForms(user._id.toString())
  }

  @Get(':id')
  async getFormById(@Param('id') id: string) {
    return this.formsService.getFormById(id)
  }

  @Post()
  @UseGuards(JwtGuard)
  async createForm(@CurrentUser() user: any, @Body() createFormDto: CreateFormDto) {
    return this.formsService.createForm(user._id.toString(), createFormDto)
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updateForm(@CurrentUser() user: any, @Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.updateForm(user._id.toString(), id, updateFormDto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteForm(@CurrentUser() user: any, @Param('id') id: string) {
    return this.formsService.deleteForm(user._id.toString(), id)
  }

  @Post(':id/submit')
  async submitFormResponse(@Param('id') id: string, @Body() responseData: SubmitFormResponseDto) {
    return this.formsService.submitFormResponse(id, responseData)
  }
}
