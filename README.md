# Movie Reservation System API

A robust RESTful API built with NestJS for managing movie reservations, showtimes, and theater operations. This backend service powers the [moviereserv](https://github.com/gideonadeti/moviereserv) frontend application—a full-featured movie ticket reservation system with authentication, role-based access control, and seamless integration with The Movie Database (TMDB) API.

[Live Demo](https://moviereserv.vercel.app) | [Video Walkthrough](https://youtu.be/uXvKouVCD5s)

## Table of Contents

- [Movie Reservation System API](#movie-reservation-system-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Authentication \& Authorization](#authentication--authorization)
    - [Showtime Management](#showtime-management)
    - [Reservation System](#reservation-system)
    - [Theater Management](#theater-management)
    - [API Features](#api-features)
  - [Screenshots](#screenshots)
  - [Technologies Used](#technologies-used)
    - [Core Framework](#core-framework)
    - [Database \& ORM](#database--orm)
    - [Authentication](#authentication)
    - [API Documentation](#api-documentation)
    - [Email Service](#email-service)
    - [Development Tools](#development-tools)
    - [Testing](#testing)
  - [Running Locally](#running-locally)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation Steps](#installation-steps)
  - [Deployment](#deployment)
    - [Vercel Deployment](#vercel-deployment)
  - [Contributing](#contributing)
    - [Development Guidelines](#development-guidelines)
  - [Support](#support)
  - [Acknowledgements](#acknowledgements)

## Features

### Authentication & Authorization

- **User Registration & Login** - Secure user authentication with JWT tokens
- **Password Reset** - Email-based password recovery system
- **Refresh Tokens** - Automatic token refresh for seamless sessions
- **Role-Based Access Control** - Admin and non-admin user roles
- **Account Management** - Delete account functionality
- **Cookie-Based Authentication** - Secure HTTP-only cookies for token storage

### Showtime Management

- **Create & Manage Showtimes** - Admins can create and update movie showtimes
- **Bulk Showtime Seeding** - Generate multiple showtimes with TMDB integration
- **Showtime Filtering** - Filter by date, movie, and auditorium
- **Showtime Reports** - Detailed reports for each showtime
- **TMDB Integration** - Automatic movie data synchronization

### Reservation System

- **Create Reservations** - Users can reserve multiple seats for a showtime
- **Cancel Reservations** - Users can cancel their own reservations
- **Reservation History** - View all user reservations
- **Seat Availability** - Real-time seat availability checking
- **Payment Tracking** - Track amounts charged and paid per reservation

### Theater Management

- **Auditorium Management** - Create and manage multiple auditoriums
- **Seat Configuration** - Configure seats for each auditorium
- **Capacity Management** - Track auditorium capacity
- **Seat Reports** - Detailed reports per seat

### API Features

- **RESTful API Design** - Clean, consistent API endpoints
- **Input Validation** - Comprehensive request validation using class-validator
- **Error Handling** - Structured error responses
- **Request Logging** - Comprehensive logging middleware
- **CORS Support** - Configurable CORS for frontend integration

## Screenshots

For screenshots, please visit the [moviereserv repository](https://github.com/gideonadeti/moviereserv/?tab=readme-ov-file#screenshots).

## Technologies Used

### Core Framework

- **NestJS** - Progressive Node.js framework for building efficient server-side applications
- **TypeScript** - Type-safe development

### Database & ORM

- **PostgreSQL** - Robust relational database
- **Prisma** - Modern database toolkit and ORM

### Authentication

- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for stateless authentication
- **bcryptjs** - Password hashing

### API Documentation

- **Swagger/OpenAPI** - Interactive API documentation

### Email Service

- **Nodemailer** - Email sending functionality for password resets

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

### Testing

- **k6** - Load testing and concurrency testing for race condition validation
  - See [k6-tests/HOW-TO-RUN.md](./k6-tests/HOW-TO-RUN.md) for instructions on running concurrency tests

## Running Locally

### Prerequisites

- Node.js (v22 or higher)
- PostgreSQL database
- npm or bun package manager
- TMDB API credentials (Bearer Token and Account ID)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/movie_reservation_db"
DIRECT_URL="postgresql://user:password@localhost:5432/movie_reservation_db"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Frontend Configuration
FRONTEND_BASE_URL="http://localhost:3001"

# Email Configuration (Optional - for password reset)
GOOGLE_APP_PASSWORD="your-google-app-password"

# TMDB API Configuration
TMDB_API_BASE_URL="https://api.themoviedb.org/3"
TMDB_BEARER_TOKEN="your-tmdb-bearer-token"
TMDB_ACCOUNT_ID="your-tmdb-account-id"

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd movie-reservation-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

4. **Seed initial data (optional)**

   ```bash
   # Seed auditoriums
   npm run seed:auditoriums
   ```

5. **Start the development server**

   ```bash
   npm run start:dev
   # or
   bun run start:dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000/api/v1`
   - Swagger Documentation: `http://localhost:3000/api/v1/documentation`

## Deployment

### Vercel Deployment

This project is deployed on [Vercel](https://vercel.com/). To deploy your own instance:

1. **Create a New Project**  
   - Go to your Vercel dashboard and create a new project.
   - Import this repository from GitHub.

2. **Customize Build Settings**
   - **Build Command:**  
     Set the build command to generate the Prisma client before building NestJS, for example:  

     ```bash
     bunx prisma generate && bunx nest build
     ```

   - **Output Directory:**  
     Set the output directory to `dist`.
   - *(Optional)* **Install Command:**  
     Change the install command to use Bun:  

     ```bash
     bun install
     ```

3. **Add Environment Variables**
   - Go to the "Environment Variables" section in your Vercel project settings.
   - Tip: Open your local `.env` file, copy all contents, and paste them into Vercel. Vercel will auto-detect and create the required keys for you to assign values.
   - For production deployment, make sure to:
     - Set `NODE_ENV=production`
     - Set the correct value for `FRONTEND_BASE_URL` to allow CORS from your frontend client

4. **Deploy**
   - After, click on deploy

Refer to the [Vercel documentation](https://vercel.com/docs) for more detailed instructions if necessary.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Update documentation as needed

## Support

If you find this project helpful or interesting, consider supporting me:

[☕ Buy me a coffee](https://buymeacoffee.com/gideonadeti)

## Acknowledgements

This project is inspired by the [roadmap.sh](https://roadmap.sh) [Movie Reservation System](https://roadmap.sh/projects/movie-reservation-system) challenge.

Built with open-source technologies:

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Passport.js](http://www.passportjs.org/) - Authentication middleware

Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
