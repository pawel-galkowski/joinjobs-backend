import { IsString, IsOptional } from 'class-validator'

export class CreatePostDto {
  @IsString()
  text!: string
}

export class CreateCommentDto {
  @IsString()
  text!: string
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  text?: string
}
