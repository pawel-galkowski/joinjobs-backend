import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { Post, PostSchema } from '../schemas/post.schema'
import { User, UserSchema } from '../schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService]
})
export class PostsModule {}
