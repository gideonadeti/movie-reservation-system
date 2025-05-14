# Movie Reservation System

A backend system that allows users to reserve movie tickets and manage them.

## Features

- **User Authentication & Authorization**
  - Sign-up, sign-in, and sign-out with role-based access control (`ADMIN` / `NADMIN`).

- **Movie & Showtime Management** (Admin only)
  - Add, update, and delete movies.
  - Add, update, and delete showtimes.

- **Reservations**
  - View movies and showtimes by date.
  - Select and reserve available seats.
  - View or cancel upcoming reservations.
  - Admins can view all reservations and revenue statistics.

- **Seat Management**
  - Prevent double bookings.

## Tech Stack

- **Backend:** NestJS
- **Database:** PostgreSQL (via Supabase) using Prisma ORM
- **Authentication:** Passport.js + JWT + Cookies
- **Deployment:** Docker on AWS EC2

## Installation

```bash
git clone https://github.com/gideonadeti/movie-reservation-system.git
cd movie-reservation-system
npm install
```

## Environment Setup

Create a `.env` file with the following:

```env
DATABASE_URL="<your-supabase-database-url>"
DIRECT_URL="<your-supabase-direct-url>"

JWT_ACCESS_SECRET="<your-jwt-access-secret>"   # Use `openssl rand -base64 32` to generate
JWT_REFRESH_SECRET="<your-jwt-refresh-secret>"
```

## Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Running the Project

```bash
npm run start:dev
```

Swagger API docs will be available at:
`http://localhost:3000/api/documentation`

## Live Deployment

Check out the live API on [Render](https://movie-reservation-system.onrender.com/api/documentation)

## Background

This project is inspired by the [roadmap.sh](https://roadmap.sh) backend developer roadmap:
[Movie Reservation System Challenge](https://roadmap.sh/projects/movie-reservation-system)
