import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Post } from '../schemas/post.schema'
import { CreatePostDto, CreateCommentDto, UpdatePostDto } from './dto/post.dto'
import { User } from '../schemas/user.schema'

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async getAllPosts() {
    try {
      const posts = await this.postModel
        .find()
        .sort({ date: -1 })
        .populate('user', ['name', 'avatar', 'email'])
        .populate('comments.user', ['name', 'avatar'])
        .populate('likes.user', ['_id'])
      return posts
    } catch (error) {
      throw new BadRequestException((error as any).message || 'Failed to fetch posts')
    }
  }

  async getPostById(postId: string) {
    try {
      const post = await this.postModel
        .findById(postId)
        .populate('user', ['name', 'avatar', 'email'])
        .populate('comments.user', ['name', 'avatar'])
        .populate('likes.user', ['_id'])

      if (!post) {
        throw new NotFoundException('Post not found')
      }
      return post
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to fetch post')
    }
  }

  async createPost(userId: string, createPostDto: CreatePostDto) {
    try {
      const user = await this.userModel.findById(userId)
      if (!user) {
        throw new NotFoundException('User not found')
      }

      const post = new this.postModel({
        text: createPostDto.text,
        name: user.name,
        avatar: user.avatar,
        user: userId
      })

      await post.save()
      return post.populate('user', ['name', 'avatar', 'email'])
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to create post')
    }
  }

  async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      if (post.user.toString() !== userId) {
        throw new BadRequestException('Not authorized to update this post')
      }

      Object.assign(post, updatePostDto)
      await post.save()
      return post
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to update post')
    }
  }

  async deletePost(userId: string, postId: string) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      if (post.user.toString() !== userId) {
        throw new BadRequestException('Not authorized to delete this post')
      }

      await this.postModel.findByIdAndDelete(postId)
      return { message: 'Post deleted successfully' }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete post')
    }
  }

  async likePost(userId: string, postId: string) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      const alreadyLiked = post.likes.some(like => like.user?.toString() === userId)
      if (alreadyLiked) {
        throw new BadRequestException('Post already liked by user')
      }

      post.likes.push({ user: userId } as any)
      await post.save()
      return post
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to like post')
    }
  }

  async unlikePost(userId: string, postId: string) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      const likeIndex = post.likes.findIndex(like => like.user?.toString() === userId)
      if (likeIndex === -1) {
        throw new BadRequestException('Post not liked by user')
      }

      post.likes.splice(likeIndex, 1)
      await post.save()
      return post
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to unlike post')
    }
  }

  async addComment(userId: string, postId: string, commentDto: CreateCommentDto) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      const user = await this.userModel.findById(userId)
      if (!user) {
        throw new NotFoundException('User not found')
      }

      const comment = {
        text: commentDto.text,
        name: user.name,
        avatar: user.avatar,
        user: userId,
        date: new Date()
      }

      post.comments.unshift(comment as any)
      await post.save()
      return post
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new BadRequestException((error as any).message || 'Failed to add comment')
    }
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    try {
      const post = await this.postModel.findById(postId)
      if (!post) {
        throw new NotFoundException('Post not found')
      }

      const comment = post.comments.find(c => (c as any)._id?.toString() === commentId)
      if (!comment) {
        throw new NotFoundException('Comment not found')
      }

      if (comment.user?.toString() !== userId) {
        throw new BadRequestException('Not authorized to delete this comment')
      }

      post.comments = post.comments.filter(c => (c as any)._id?.toString() !== commentId)
      await post.save()
      return post
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
      throw new BadRequestException((error as any).message || 'Failed to delete comment')
    }
  }
}
