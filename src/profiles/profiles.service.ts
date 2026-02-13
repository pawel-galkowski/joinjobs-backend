import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Profile } from '../schemas/profile.schema'
import { CreateProfileDto, UpdateProfileDto, CreateExperienceDto, CreateEducationDto } from './dto/profile.dto'

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>
  ) {}

  async getAllProfiles() {
    try {
      const profiles = await this.profileModel.find().populate('user', ['name', 'avatar', 'email'])
      return profiles
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to fetch profiles')
    }
  }

  async getProfileByUserId(userId: string) {
    try {
      const profile = await this.profileModel.findOne({ user: userId }).populate('user', ['name', 'avatar', 'email'])
      if (!profile) {
        throw new NotFoundException('Profile not found for this user')
      }
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to fetch profile')
    }
  }

  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    try {
      const existingProfile = await this.profileModel.findOne({ user: userId })
      if (existingProfile) {
        throw new BadRequestException('Profile already exists for this user')
      }

      const profile = new this.profileModel({
        user: userId,
        ...createProfileDto
      })

      await profile.save()
      return profile.populate('user', ['name', 'avatar', 'email'])
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to create profile')
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      let profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      Object.assign(profile, updateProfileDto)
      await profile.save()
      return profile.populate('user', ['name', 'avatar', 'email'])
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to update profile')
    }
  }

  async addExperience(userId: string, experienceDto: CreateExperienceDto) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      profile.experience.unshift(experienceDto as any)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to add experience')
    }
  }

  async updateExperience(userId: string, experienceId: string, experienceDto: CreateExperienceDto) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      const experience = profile.experience.find(exp => exp._id.toString() === experienceId)
      if (!experience) {
        throw new NotFoundException('Experience not found')
      }

      Object.assign(experience, experienceDto)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to update experience')
    }
  }

  async deleteExperience(userId: string, experienceId: string) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      profile.experience = profile.experience.filter(exp => exp._id.toString() !== experienceId)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete experience')
    }
  }

  async addEducation(userId: string, educationDto: CreateEducationDto) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      profile.education.unshift(educationDto as any)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to add education')
    }
  }

  async updateEducation(userId: string, educationId: string, educationDto: CreateEducationDto) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      const education = profile.education.find(edu => edu._id.toString() === educationId)
      if (!education) {
        throw new NotFoundException('Education not found')
      }

      Object.assign(education, educationDto)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to update education')
    }
  }

  async deleteEducation(userId: string, educationId: string) {
    try {
      const profile = await this.profileModel.findOne({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }

      profile.education = profile.education.filter(edu => edu._id.toString() !== educationId)
      await profile.save()
      return profile
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete education')
    }
  }

  async deleteProfile(userId: string) {
    try {
      const profile = await this.profileModel.findOneAndDelete({ user: userId })
      if (!profile) {
        throw new NotFoundException('Profile not found')
      }
      return { message: 'Profile deleted successfully' }
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete profile')
    }
  }
}
