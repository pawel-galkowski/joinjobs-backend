import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ProfilesService } from './profiles.service'
import { Profile } from '../schemas/profile.schema'

describe('ProfilesService', () => {
  let service: ProfilesService
  let mockProfileModel: any

  beforeEach(async () => {
    mockProfileModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findOneAndDelete: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getModelToken(Profile.name),
          useValue: mockProfileModel
        }
      ]
    }).compile()

    service = module.get<ProfilesService>(ProfilesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProfiles', () => {
    it('should return all profiles', async () => {
      const mockProfiles = [
        {
          _id: '1',
          user: 'user1',
          status: 'Senior Developer',
          skills: ['JavaScript', 'TypeScript'],
          populate: jest.fn().mockReturnThis()
        }
      ]

      mockProfileModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProfiles)
      })

      const result = await service.getAllProfiles()

      expect(result).toEqual(mockProfiles)
    })
  })

  describe('getProfileByUserId', () => {
    it('should return profile by user id', async () => {
      const userId = 'user1'
      const mockProfile = {
        _id: '1',
        user: userId,
        status: 'Senior Developer',
        skills: ['JavaScript'],
        populate: jest.fn().mockResolvedValue({})
      }

      mockProfileModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProfile)
      })

      const result = await service.getProfileByUserId(userId)

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ user: userId })
    })

    it('should throw not found error', async () => {
      mockProfileModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      })

      await expect(service.getProfileByUserId('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const userId = 'user1'
      const createProfileDto = {
        status: 'Senior Developer',
        skills: ['JavaScript', 'TypeScript'],
        company: 'Tech Corp'
      }

      const mockProfile = {
        ...createProfileDto,
        user: userId,
        save: jest.fn().mockResolvedValue({}),
        populate: jest.fn().mockResolvedValue({})
      }

      mockProfileModel.findOne.mockResolvedValue(null)
      mockProfileModel.mockImplementation((data) => mockProfile)

      const result = await service.createProfile(userId, createProfileDto)

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ user: userId })
    })

    it('should throw error if profile already exists', async () => {
      const userId = 'user1'
      const createProfileDto = {
        status: 'Senior Developer',
        skills: ['JavaScript']
      }

      mockProfileModel.findOne.mockResolvedValue({ user: userId })

      await expect(service.createProfile(userId, createProfileDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('addExperience', () => {
    it('should add experience to profile', async () => {
      const userId = 'user1'
      const experienceDto = {
        title: 'Developer',
        company: 'Tech Corp',
        from: new Date()
      }

      const mockProfile = {
        user: userId,
        experience: [],
        unshift: jest.fn(),
        save: jest.fn().mockResolvedValue({})
      }

      mockProfileModel.findOne.mockResolvedValue(mockProfile)

      await service.addExperience(userId, experienceDto)

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ user: userId })
      expect(mockProfile.save).toHaveBeenCalled()
    })

    it('should throw error if profile not found', async () => {
      mockProfileModel.findOne.mockResolvedValue(null)

      await expect(
        service.addExperience('user1', {
          title: 'Developer',
          company: 'Tech Corp',
          from: new Date()
        })
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      const userId = 'user1'
      const mockProfile = { _id: '1', user: userId }

      mockProfileModel.findOneAndDelete.mockResolvedValue(mockProfile)

      const result = await service.deleteProfile(userId)

      expect(result).toHaveProperty('message')
      expect(mockProfileModel.findOneAndDelete).toHaveBeenCalledWith({ user: userId })
    })

    it('should throw error if profile not found', async () => {
      mockProfileModel.findOneAndDelete.mockResolvedValue(null)

      await expect(service.deleteProfile('user1')).rejects.toThrow(NotFoundException)
    })
  })
})
