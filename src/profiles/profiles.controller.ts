import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ProfilesService } from './profiles.service'
import { CreateProfileDto, UpdateProfileDto, CreateExperienceDto, CreateEducationDto } from './dto/profile.dto'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getAllProfiles() {
    return this.profilesService.getAllProfiles()
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.getProfileByUserId(user._id.toString())
  }

  @Get(':userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.profilesService.getProfileByUserId(userId)
  }

  @Post()
  @UseGuards(JwtGuard)
  async createProfile(@CurrentUser() user: any, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.createProfile(user._id.toString(), createProfileDto)
  }

  @Put('me')
  @UseGuards(JwtGuard)
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(user._id.toString(), updateProfileDto)
  }

  @Post('experience')
  @UseGuards(JwtGuard)
  async addExperience(@CurrentUser() user: any, @Body() experienceDto: CreateExperienceDto) {
    return this.profilesService.addExperience(user._id.toString(), experienceDto)
  }

  @Put('experience/:experienceId')
  @UseGuards(JwtGuard)
  async updateExperience(
    @CurrentUser() user: any,
    @Param('experienceId') experienceId: string,
    @Body() experienceDto: CreateExperienceDto
  ) {
    return this.profilesService.updateExperience(user._id.toString(), experienceId, experienceDto)
  }

  @Delete('experience/:experienceId')
  @UseGuards(JwtGuard)
  async deleteExperience(@CurrentUser() user: any, @Param('experienceId') experienceId: string) {
    return this.profilesService.deleteExperience(user._id.toString(), experienceId)
  }

  @Post('education')
  @UseGuards(JwtGuard)
  async addEducation(@CurrentUser() user: any, @Body() educationDto: CreateEducationDto) {
    return this.profilesService.addEducation(user._id.toString(), educationDto)
  }

  @Put('education/:educationId')
  @UseGuards(JwtGuard)
  async updateEducation(
    @CurrentUser() user: any,
    @Param('educationId') educationId: string,
    @Body() educationDto: CreateEducationDto
  ) {
    return this.profilesService.updateEducation(user._id.toString(), educationId, educationDto)
  }

  @Delete('education/:educationId')
  @UseGuards(JwtGuard)
  async deleteEducation(@CurrentUser() user: any, @Param('educationId') educationId: string) {
    return this.profilesService.deleteEducation(user._id.toString(), educationId)
  }

  @Delete('me')
  @UseGuards(JwtGuard)
  async deleteProfile(@CurrentUser() user: any) {
    return this.profilesService.deleteProfile(user._id.toString())
  }
}
