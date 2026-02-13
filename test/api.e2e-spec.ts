import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../app.module'

describe('Auth API (e2e)', () => {
  let app: INestApplication
  let jwtToken: string
  let userId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'password123',
          role: 'user'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')

      // Save token and userId for other tests
      if (response.body.token) {
        jwtToken = response.body.token
        userId = response.body.user._id
      }
    })

    it('should fail with duplicate email', async () => {
      const email = `test-duplicate-${Date.now()}@example.com`

      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email,
          password: 'password123',
          role: 'user'
        })

      // Second registration with same email should fail
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email,
          password: 'password456',
          role: 'user'
        })

      expect(response.status).toBe(400)
    })

    it('should fail with missing required fields', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'Test User'
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    let testEmail: string
    let testPassword: string

    beforeAll(async () => {
      testEmail = `login-test-${Date.now()}@example.com`
      testPassword = 'testPassword123'

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: testEmail,
          password: testPassword,
          role: 'user'
        })
    })

    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
    })

    it('should fail with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongPassword'
        })

      expect(response.status).toBe(401)
    })

    it('should fail with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anyPassword'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      // First register to get a token
      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Current User Test',
          email: `current-user-${Date.now()}@example.com`,
          password: 'password123',
          role: 'user'
        })

      const token = registerRes.body.token

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('email')
    })

    it('should fail without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/me')

      expect(response.status).toBe(401)
    })
  })
})

describe('Profiles API (e2e)', () => {
  let app: INestApplication
  let jwtToken: string
  let profileId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )

    await app.init()

    // Register and login user
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Profile Test User',
        email: `profile-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      })

    jwtToken = registerRes.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/profiles', () => {
    it('should get all profiles', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profiles')
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/profiles', () => {
    it('should create profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/profiles')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          status: 'Senior Developer',
          skills: ['JavaScript', 'TypeScript', 'NestJS'],
          company: 'Tech Company',
          website: 'https://example.com'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      profileId = response.body._id
    })
  })

  describe('GET /api/profiles/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/profiles/me')
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
    })
  })

  describe('PUT /api/profiles', () => {
    it('should update profile', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/profiles')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          status: 'Principal Engineer',
          skills: ['JavaScript', 'TypeScript', 'NestJS', 'React']
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
    })
  })
})

describe('Posts API (e2e)', () => {
  let app: INestApplication
  let jwtToken: string
  let postId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )

    await app.init()

    // Register user
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Post Test User',
        email: `post-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      })

    jwtToken = registerRes.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/posts')
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/posts', () => {
    it('should create a post', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          text: 'This is a test post with some content'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('text')
      postId = response.body._id
    })

    it('should fail without text', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      // First create a post
      const createRes = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ text: 'Test post for liking' })

      const testPostId = createRes.body._id

      const response = await request(app.getHttpServer())
        .post(`/api/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('likes')
    })
  })

  describe('POST /api/posts/:id/comment', () => {
    it('should add comment to post', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/posts/${postId}/comment`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          text: 'Great post!'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('comments')
    })
  })
})

describe('Forms API (e2e)', () => {
  let app: INestApplication
  let jwtToken: string
  let formId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )

    await app.init()

    // Register user
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Form Test User',
        email: `form-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user'
      })

    jwtToken = registerRes.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/forms', () => {
    it('should get all forms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/forms')
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/forms', () => {
    it('should create a form', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/forms')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Test Contact Form',
          company: 'Tech Corp',
          fields: [
            {
              label: 'Name',
              type: 'text',
              required: true
            },
            {
              label: 'Email',
              type: 'email',
              required: true
            }
          ]
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      formId = response.body._id
    })
  })

  describe('GET /api/forms/company/:company', () => {
    it('should get forms by company', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/forms/company/Tech%20Corp')
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('GET /api/forms/:id', () => {
    it('should get form by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('_id')
    })
  })
})
