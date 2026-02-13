import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class FormFieldDto {
  @IsString()
  label!: string

  @IsString()
  type!: string

  @IsOptional()
  required?: boolean

  @IsOptional()
  @IsArray()
  options?: string[]
}

export class CreateFormDto {
  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  company!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields!: FormFieldDto[]
}

export class UpdateFormDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[]
}

export class SubmitFormResponseDto {
  @IsArray()
  responses!: Record<string, any>[]
}
