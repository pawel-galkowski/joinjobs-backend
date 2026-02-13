import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto, LoginDto } from './dto/user.dto'
import { JwtGuard } from './guards/jwt.guard'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user._id.toString())
  }

  @Post('confirm-email/:token')
  async confirmEmail(@Param('token') token: string) {
    return this.authService.confirmEmail(token)
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email)
  }

  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body('password') password: string) {
    return this.authService.resetPassword(token, password)
  }
}
