import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Post } from '../schemas/post.schema'
import { User } from '../schemas/user.schema'

describe('PostsService', () => {
  let service: PostsService
  let mockPostModel: any
  let mockUserModel: any

  beforeEach(async () => {
    mockPostModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn()
    }

    mockUserModel = {
      findById: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile()

    service = module.get<PostsService>(PostsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          _id: '1',
          text: 'Test post',
          user: 'user1',
          likes: [],
          comments: [],
          date: new Date()
        }
      ]

      mockPostModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts)
      })

      // Need to mock the entire chain
      const promise = mockPostModel
        .find()
        .sort({ date: -1 })
        .populate('user', ['name', 'avatar', 'email'])
        .populate('comments.user', ['name', 'avatar'])
        .populate('likes.user', ['_id'])

      jest.spyOn(promise, 'then' as any).mockResolvedValue(mockPosts)

      // Actually, let's simplify by just mocking the return
      mockPostModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn()
          .mockReturnThis()
          .mockReturnThis()
          .mockResolvedValue(mockPosts)
      })

      const result = await service.getAllPosts()

      expect(result).toEqual(mockPosts)
    })
  })

  describe('getPostById', () => {
    it('should return post by id', async () => {
      const postId = '1'
      const mockPost = {
        _id: postId,
        text: 'Test post',
        user: 'user1'
      }

      mockPostModel.findById.mockReturnValue({
        populate: jest.fn()
          .mockReturnThis()
          .mockReturnThis()
          .mockResolvedValue(mockPost)
      })

      const result = await service.getPostById(postId)

      expect(result).toEqual(mockPost)
    })

    it('should throw not found error', async () => {
      mockPostModel.findById.mockReturnValue({
        populate: jest.fn()
          .mockReturnThis()
          .mockReturnThis()
          .mockResolvedValue(null)
      })

      await expect(service.getPostById('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const userId = 'user1'
      const createPostDto = {
        text: 'Test post'
      }

      const mockUser = {
        _id: userId,
        name: 'Test User',
        avatar: 'avatar-url'
      }

      const mockPost = {
        ...createPostDto,
        user: userId,
        name: mockUser.name,
        avatar: mockUser.avatar,
        save: jest.fn().mockResolvedValue({}),
        populate: jest.fn().mockResolvedValue({})
      }

      mockUserModel.findById.mockResolvedValue(mockUser)
      mockPostModel.mockImplementation(() => mockPost)

      await service.createPost(userId, createPostDto)

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId)
    })

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null)

      await expect(service.createPost('user1', { text: 'Test' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('likePost', () => {
    it('should like a post', async () => {
      const userId = 'user1'
      const postId = '1'
      const mockPost = {
        _id: postId,
        likes: [],
        some: jest.fn().mockReturnValue(false),
        push: jest.fn(),
        save: jest.fn().mockResolvedValue({})
      }

      mockPostModel.findById.mockResolvedValue(mockPost)

      await service.likePost(userId, postId)

      expect(mockPostModel.findById).toHaveBeenCalledWith(postId)
      expect(mockPost.save).toHaveBeenCalled()
    })

    it('should throw error if post not found', async () => {
      mockPostModel.findById.mockResolvedValue(null)

      await expect(service.likePost('user1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should throw error if already liked', async () => {
      const userId = 'user1'
      const postId = '1'
      const mockPost = {
        _id: postId,
        likes: [{ user: userId }],
        some: jest.fn().mockReturnValue(true)
      }

      mockPostModel.findById.mockResolvedValue(mockPost)

      await expect(service.likePost(userId, postId)).rejects.toThrow(BadRequestException)
    })
  })

  describe('addComment', () => {
    it('should add comment to post', async () => {
      const userId = 'user1'
      const postId = '1'
      const commentDto = { text: 'Great post!' }

      const mockUser = {
        _id: userId,
        name: 'Test User',
        avatar: 'avatar-url'
      }

      const mockPost = {
        _id: postId,
        comments: [],
        unshift: jest.fn(),
        save: jest.fn().mockResolvedValue({})
      }

      mockPostModel.findById.mockResolvedValue(mockPost)
      mockUserModel.findById.mockResolvedValue(mockUser)

      await service.addComment(userId, postId, commentDto)

      expect(mockPostModel.findById).toHaveBeenCalledWith(postId)
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId)
      expect(mockPost.save).toHaveBeenCalled()
    })

    it('should throw error if post not found', async () => {
      mockPostModel.findById.mockResolvedValue(null)

      await expect(service.addComment('user1', 'nonexistent', { text: 'Test' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const userId = 'user1'
      const postId = '1'
      const mockPost = {
        _id: postId,
        user: { toString: jest.fn().mockReturnValue(userId) }
      }

      mockPostModel.findById.mockResolvedValue(mockPost)
      mockPostModel.findByIdAndDelete.mockResolvedValue(mockPost)

      const result = await service.deletePost(userId, postId)

      expect(result).toHaveProperty('message')
      expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledWith(postId)
    })

    it('should throw error if post not found', async () => {
      mockPostModel.findById.mockResolvedValue(null)

      await expect(service.deletePost('user1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should throw error if not authorized', async () => {
      const userId = 'user1'
      const postId = '1'
      const mockPost = {
        _id: postId,
        user: { toString: jest.fn().mockReturnValue('user2') }
      }

      mockPostModel.findById.mockResolvedValue(mockPost)

      await expect(service.deletePost(userId, postId)).rejects.toThrow(BadRequestException)
    })
  })
})
