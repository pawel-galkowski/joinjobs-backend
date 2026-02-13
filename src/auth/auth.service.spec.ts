import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { AuthService } from './auth.service'
import { User } from '../schemas/user.schema'

jest.mock('bcryptjs')
jest.mock('gravatar')

describe('AuthService', () => {
  let service: AuthService
  let mockUserModel: any
  let mockJwtService: any
  let mockConfigService: any

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn()
    }

    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token')
    }

    mockConfigService = {
      get: jest.fn().mockReturnValue('secret')
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      }

      const mockUser = {
        _id: '1',
        ...createUserDto,
        confirmed: false,
        toJSON: jest.fn().mockReturnValue(createUserDto)
      }

      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt')
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
      mockUserModel.create = jest.fn().mockResolvedValue({
        ...mockUser,
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(mockUser)
      })

      // Mock the constructor behavior
      const result = await service.register(createUserDto)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email })
    })

    it('should throw error if user already exists', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user'
      }

      mockUserModel.findOne.mockResolvedValue({ email: 'existing@example.com' })

      await expect(service.register(createUserDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: true,
        toJSON: jest.fn().mockReturnValue(loginDto)
      }

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.login(loginDto)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password)
    })

    it('should throw error if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      mockUserModel.findOne.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw error if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password'
      }

      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: true
      }

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw error if user email not confirmed', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: false
      }

      mockUserModel.findOne.mockResolvedValue(mockUser)

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const userId = '1'
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        toJSON: jest.fn().mockReturnValue({ email: 'test@example.com', name: 'Test User' })
      }

      mockUserModel.findById.mockResolvedValue(mockUser)

      const result = await service.getCurrentUser(userId)

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId)
    })

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null)

      await expect(service.getCurrentUser('1')).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      const confirmToken = 'test-token'
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        confirmedKey: confirmToken,
        confirmed: false,
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ email: 'test@example.com' })
      }

      mockUserModel.findOne.mockResolvedValue(mockUser)

      const result = await service.confirmEmail(confirmToken)

      expect(result).toHaveProperty('token')
      expect(mockUser.confirmed).toBe(true)
      expect(mockUser.confirmedKey).toBeNull()
    })

    it('should throw error if confirmation token is invalid', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      await expect(service.confirmEmail('invalid-token')).rejects.toThrow(BadRequestException)
    })
  })

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      const email = 'test@example.com'
      const mockUser = {
        _id: '1',
        email,
        save: jest.fn().mockResolvedValue(true)
      }

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt')
      (bcrypt.hash as jest.Mock).mockResolvedValue('recovery-token')

      const result = await service.requestPasswordReset(email)

      expect(result).toHaveProperty('message')
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email })
    })

    it('should throw error if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      await expect(service.requestPasswordReset('nonexistent@example.com')).rejects.toThrow(BadRequestException)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const recoveryToken = 'recovery-token'
      const newPassword = 'new-password'
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        recoveryToken,
        save: jest.fn().mockResolvedValue(true)
      }

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt')
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password')

      const result = await service.resetPassword(recoveryToken, newPassword)

      expect(result).toHaveProperty('message')
      expect(mockUser.recoveryToken).toBeNull()
    })

    it('should throw error if recovery token is invalid', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      await expect(service.resetPassword('invalid-token', 'new-password')).rejects.toThrow(BadRequestException)
    })
  })
})
