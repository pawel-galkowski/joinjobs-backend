import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { CreatePostDto, CreateCommentDto, UpdatePostDto } from './dto/post.dto'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts()
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id)
  }

  @Post()
  @UseGuards(JwtGuard)
  async createPost(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user._id.toString(), createPostDto)
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updatePost(@CurrentUser() user: any, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(user._id.toString(), id, updatePostDto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deletePost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postsService.deletePost(user._id.toString(), id)
  }

  @Post(':id/like')
  @UseGuards(JwtGuard)
  async likePost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postsService.likePost(user._id.toString(), id)
  }

  @Delete(':id/like')
  @UseGuards(JwtGuard)
  async unlikePost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postsService.unlikePost(user._id.toString(), id)
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  async addComment(@CurrentUser() user: any, @Param('id') id: string, @Body() commentDto: CreateCommentDto) {
    return this.postsService.addComment(user._id.toString(), id, commentDto)
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtGuard)
  async deleteComment(@CurrentUser() user: any, @Param('id') id: string, @Param('commentId') commentId: string) {
    return this.postsService.deleteComment(user._id.toString(), id, commentId)
  }
}
