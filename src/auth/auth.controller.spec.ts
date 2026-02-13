import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  let mockAuthService: any

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getCurrentUser: jest.fn(),
      confirmEmail: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      }

      const expectedResult = {
        token: 'test-token',
        user: createUserDto
      }

      mockAuthService.register.mockResolvedValue(expectedResult)

      const result = await controller.register(createUserDto)

      expect(result).toEqual(expectedResult)
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('login', () => {
    it('should call authService.login with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      }

      const expectedResult = {
        token: 'test-token',
        user: { email: 'test@example.com' }
      }

      mockAuthService.login.mockResolvedValue(expectedResult)

      const result = await controller.login(loginDto)

      expect(result).toEqual(expectedResult)
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto)
    })
  })

  describe('me', () => {
    it('should get current user', async () => {
      const userId = '1'
      const expectedUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User'
      }

      mockAuthService.getCurrentUser.mockResolvedValue(expectedUser)

      const result = await controller.me({ userId } as any)

      expect(result).toEqual(expectedUser)
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(userId)
    })
  })

  describe('confirmEmail', () => {
    it('should confirm email with token', async () => {
      const token = 'test-token'
      const expectedResult = {
        token: 'jwt-token',
        user: { email: 'test@example.com' }
      }

      mockAuthService.confirmEmail.mockResolvedValue(expectedResult)

      const result = await controller.confirmEmail({ token })

      expect(result).toEqual(expectedResult)
      expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(token)
    })
  })

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      const email = 'test@example.com'
      const expectedResult = { message: 'Recovery email sent' }

      mockAuthService.requestPasswordReset.mockResolvedValue(expectedResult)

      const result = await controller.requestPasswordReset({ email })

      expect(result).toEqual(expectedResult)
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(email)
    })
  })

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      const dto = {
        token: 'recovery-token',
        newPassword: 'new-password'
      }

      const expectedResult = { message: 'Password reset successfully' }

      mockAuthService.resetPassword.mockResolvedValue(expectedResult)

      const result = await controller.resetPassword(dto)

      expect(result).toEqual(expectedResult)
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword)
    })
  })
})
