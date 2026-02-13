import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { FormsService } from './forms.service'
import { Form } from '../schemas/form.schema'

describe('FormsService', () => {
  let service: FormsService
  let mockFormModel: any

  beforeEach(async () => {
    mockFormModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: getModelToken(Form.name),
          useValue: mockFormModel
        }
      ]
    }).compile()

    service = module.get<FormsService>(FormsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllForms', () => {
    it('should return all forms', async () => {
      const mockForms = [
        {
          _id: '1',
          name: 'Contact Form',
          company: 'Tech Corp',
          fields: [],
          date: new Date()
        }
      ]

      mockFormModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockForms)
      })

      const result = await service.getAllForms()

      expect(result).toEqual(mockForms)
    })
  })

  describe('getFormsByCompany', () => {
    it('should return forms by company', async () => {
      const company = 'Tech Corp'
      const mockForms = [
        {
          _id: '1',
          name: 'Contact Form',
          company,
          fields: []
        }
      ]

      mockFormModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockForms)
      })

      const result = await service.getFormsByCompany(company)

      expect(result).toEqual(mockForms)
      expect(mockFormModel.find).toHaveBeenCalledWith({ company })
    })
  })

  describe('getFormById', () => {
    it('should return form by id', async () => {
      const formId = '1'
      const mockForm = {
        _id: formId,
        name: 'Contact Form',
        company: 'Tech Corp'
      }

      mockFormModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockForm)
      })

      const result = await service.getFormById(formId)

      expect(result).toEqual(mockForm)
      expect(mockFormModel.findById).toHaveBeenCalledWith(formId)
    })

    it('should throw not found error', async () => {
      mockFormModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      })

      await expect(service.getFormById('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getUserForms', () => {
    it('should return forms for user', async () => {
      const userId = 'user1'
      const mockForms = [
        {
          _id: '1',
          name: 'Contact Form',
          user: userId,
          company: 'Tech Corp'
        }
      ]

      mockFormModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockForms)
      })

      const result = await service.getUserForms(userId)

      expect(result).toEqual(mockForms)
      expect(mockFormModel.find).toHaveBeenCalledWith({ user: userId })
    })
  })

  describe('createForm', () => {
    it('should create a new form', async () => {
      const userId = 'user1'
      const createFormDto = {
        name: 'Contact Form',
        company: 'Tech Corp',
        fields: []
      }

      const mockForm = {
        ...createFormDto,
        user: userId,
        save: jest.fn().mockResolvedValue({}),
        populate: jest.fn().mockResolvedValue({})
      }

      mockFormModel.mockImplementation(() => mockForm)

      await service.createForm(userId, createFormDto)

      expect(mockForm.save).toHaveBeenCalled()
    })
  })

  describe('updateForm', () => {
    it('should update form successfully', async () => {
      const userId = 'user1'
      const formId = '1'
      const updateFormDto = {
        name: 'Updated Form'
      }

      const mockForm = {
        _id: formId,
        user: { toString: jest.fn().mockReturnValue(userId) },
        name: 'Contact Form',
        save: jest.fn().mockResolvedValue({})
      }

      mockFormModel.findById.mockResolvedValue(mockForm)

      await service.updateForm(userId, formId, updateFormDto)

      expect(mockFormModel.findById).toHaveBeenCalledWith(formId)
      expect(mockForm.save).toHaveBeenCalled()
    })

    it('should throw error if form not found', async () => {
      mockFormModel.findById.mockResolvedValue(null)

      await expect(service.updateForm('user1', 'nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException)
    })

    it('should throw error if not authorized', async () => {
      const userId = 'user1'
      const formId = '1'
      const mockForm = {
        _id: formId,
        user: { toString: jest.fn().mockReturnValue('user2') }
      }

      mockFormModel.findById.mockResolvedValue(mockForm)

      await expect(service.updateForm(userId, formId, { name: 'Updated' })).rejects.toThrow(BadRequestException)
    })
  })

  describe('deleteForm', () => {
    it('should delete form successfully', async () => {
      const userId = 'user1'
      const formId = '1'
      const mockForm = {
        _id: formId,
        user: { toString: jest.fn().mockReturnValue(userId) }
      }

      mockFormModel.findById.mockResolvedValue(mockForm)
      mockFormModel.findByIdAndDelete.mockResolvedValue(mockForm)

      const result = await service.deleteForm(userId, formId)

      expect(result).toHaveProperty('message')
      expect(mockFormModel.findByIdAndDelete).toHaveBeenCalledWith(formId)
    })

    it('should throw error if form not found', async () => {
      mockFormModel.findById.mockResolvedValue(null)

      await expect(service.deleteForm('user1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should throw error if not authorized', async () => {
      const userId = 'user1'
      const formId = '1'
      const mockForm = {
        _id: formId,
        user: { toString: jest.fn().mockReturnValue('user2') }
      }

      mockFormModel.findById.mockResolvedValue(mockForm)

      await expect(service.deleteForm(userId, formId)).rejects.toThrow(BadRequestException)
    })
  })

  describe('submitFormResponse', () => {
    it('should submit form response successfully', async () => {
      const formId = '1'
      const responseData = {
        responses: [{ fieldId: 'field1', value: 'response value' }]
      }

      const mockForm = {
        _id: formId,
        responses: [],
        push: jest.fn(),
        save: jest.fn().mockResolvedValue({})
      }

      mockFormModel.findById.mockResolvedValue(mockForm)

      const result = await service.submitFormResponse(formId, responseData)

      expect(result).toHaveProperty('message')
      expect(mockFormModel.findById).toHaveBeenCalledWith(formId)
      expect(mockForm.save).toHaveBeenCalled()
    })

    it('should throw error if form not found', async () => {
      mockFormModel.findById.mockResolvedValue(null)

      await expect(service.submitFormResponse('nonexistent', { responses: [] })).rejects.toThrow(NotFoundException)
    })
  })
})
