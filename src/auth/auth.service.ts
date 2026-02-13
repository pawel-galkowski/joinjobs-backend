import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as gravatar from 'gravatar'
import { User } from '../schemas/user.schema'
import { CreateUserDto, LoginDto } from './dto/user.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email })
    if (existingUser) {
      throw new BadRequestException('User with this email already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate avatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    // Create confirmation key
    const confirmationKey = await bcrypt.hash(email, salt)

    // Create user
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      avatar,
      role: role || 'user',
      confirmedKey: confirmationKey,
      confirmed: false
    })

    await user.save()

    // Note: Email confirmation feature to be implemented

    const token = this.generateToken(user._id.toString())
    return {
      token,
      user: user.toJSON()
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user
    const user = await this.userModel.findOne({ email })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if user is confirmed
    if (!user.confirmed) {
      throw new BadRequestException('Please verify your email first')
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const token = this.generateToken(user._id.toString())
    return {
      token,
      user: user.toJSON()
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return user.toJSON()
  }

  async confirmEmail(token: string) {
    const user = await this.userModel.findOne({ confirmedKey: token })
    if (!user) {
      throw new BadRequestException('Invalid confirmation token')
    }

    user.confirmed = true
    user.confirmedKey = null
    await user.save()

    const jwtToken = this.generateToken(user._id.toString())
    return {
      token: jwtToken,
      user: user.toJSON()
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email })
    if (!user) {
      throw new BadRequestException('User with this email does not exist')
    }

    const salt = await bcrypt.genSalt(10)
    const recoveryToken = await bcrypt.hash(email, salt)

    user.recoveryToken = recoveryToken
    await user.save()

    // Note: Email sending feature to be implemented

    return { message: 'Recovery email sent' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({ recoveryToken: token })
    if (!user) {
      throw new BadRequestException('Invalid recovery token')
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.recoveryToken = null
    await user.save()

    return { message: 'Password reset successfully' }
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign(
      { id: userId },
      {
        expiresIn: this.configService.get('JWT_EXPIRATION') || '7d'
      }
    )
  }
}
