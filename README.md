# JoinJobs Backend - NestJS

Modern backend application built with NestJS, MongoDB, and JWT authentication.

## Features

- **Authentication**: JWT-based authentication with Passport
- **User Management**: User registration, login, and profile management
- **Profiles**: Create and manage user profiles with experience and education
- **Posts**: Create, update, delete posts with comments and likes
- **Forms**: Create and manage dynamic forms
- **Authorization**: Role-based access control (User/Admin)
- **Database**: MongoDB with Mongoose
- **Validation**: Class-validator for data validation
- **Security**: Bcrypt for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/joinjobs
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Running Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── strategies/         # Passport strategies
│   ├── guards/            # Auth guards
│   ├── decorators/        # Custom decorators
│   ├── auth.service.ts    # Auth service
│   ├── auth.controller.ts # Auth controller
│   └── auth.module.ts     # Auth module
├── profiles/               # Profiles module
│   ├── dto/               # Data transfer objects
│   ├── profiles.service.ts
│   ├── profiles.controller.ts
│   └── profiles.module.ts
├── posts/                 # Posts module
│   ├── dto/              # Data transfer objects
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   └── posts.module.ts
├── forms/                # Forms module
│   ├── dto/             # Data transfer objects
│   ├── forms.service.ts
│   ├── forms.controller.ts
│   └── forms.module.ts
├── schemas/             # MongoDB schemas
│   ├── user.schema.ts
│   ├── profile.schema.ts
│   ├── post.schema.ts
│   └── form.schema.ts
├── config/              # Configuration files
│   └── database.module.ts
├── app.module.ts        # Root application module
└── main.ts             # Application entry point
```

## License

ISC

## Author

Pawel Galkowski
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
