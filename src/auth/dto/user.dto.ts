import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string = 'user'
}

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  avatar?: string
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  newPassword!: string

  @IsString()
  confirmPassword!: string
}
