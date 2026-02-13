import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProfilesService } from './profiles.service'
import { ProfilesController } from './profiles.controller'
import { Profile, ProfileSchema } from '../schemas/profile.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }])],
  providers: [ProfilesService],
  controllers: [ProfilesController],
  exports: [ProfilesService]
})
export class ProfilesModule {}
