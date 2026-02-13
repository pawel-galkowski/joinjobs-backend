import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ProfilesModule } from './profiles/profiles.module'
import { PostsModule } from './posts/posts.module'
import { FormsModule } from './forms/forms.module'

const mongoUri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@chat-vorap.mongodb.net/test?retryWrites=true&w=majority`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    MongooseModule.forRoot(mongoUri),
    AuthModule,
    ProfilesModule,
    PostsModule,
    FormsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
