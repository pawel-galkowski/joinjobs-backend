import { IsString, IsArray, IsOptional, IsDate, IsBoolean, IsUUID } from 'class-validator'

export class CreateExperienceDto {
  @IsString()
  title!: string

  @IsString()
  company!: string

  @IsOptional()
  @IsString()
  location?: string

  @IsDate()
  from!: Date

  @IsOptional()
  @IsDate()
  to?: Date

  @IsOptional()
  @IsBoolean()
  current?: boolean

  @IsOptional()
  @IsString()
  description?: string
}

export class CreateEducationDto {
  @IsUUID()
  _id!: string;

  @IsString()
  school!: string

  @IsString()
  degree!: string

  @IsString()
  fieldofstudy!: string

  @IsDate()
  from!: Date

  @IsOptional()
  @IsDate()
  to?: Date

  @IsOptional()
  @IsBoolean()
  current?: boolean

  @IsOptional()
  @IsString()
  description?: string
}

export class CreateProfileDto {
  @IsString()
  status!: string

  @IsArray()
  skills!: string[]

  @IsOptional()
  @IsString()
  company?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  githubusername?: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsArray()
  skills?: string[]

  @IsOptional()
  @IsString()
  company?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  githubusername?: string
}
