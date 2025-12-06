# Authentication System Web Application

A full-stack authentication system built with Next.js App Router, featuring secure user management, session handling, and modern UI components.

## Features

### User Features
- User registration with email verification
- Secure login with multiple authentication methods
- Password hashing using bcrypt
- Authenticated dashboard access
- Session-based authentication
- Toast notifications & form validation

### Developer Features
- Prisma ORM integration with PostgreSQL
- NextAuth.js (Credentials + OAuth providers)
- Winston logging for comprehensive error & event tracking
- Clean project structure using Next.js App Router
- Rate limiting support
- Cloudinary image upload integration
- Reusable ShadCN UI components

## Tech Stack

### Frontend
- **Next.js** (App Router) - React framework
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide Icons** - Icon library

### Backend
- **NextAuth.js** - Authentication (Credentials, Google, GitHub)
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **Bcryptjs** - Password hashing
- **Winston** - Logging system
- **Rate Limiting Middleware** - API protection

## System Requirements

| Software | Version |
|----------|---------|
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | Latest |
| Next.js | 16.0.7 |

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd assignment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE"

# Email Configuration
EMAIL_SERVER=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# OAuth Providers
GOOGLE_ID=
GOOGLE_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# NextAuth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Logging
LOG_LEVEL="info"  # debug, info, warn, error

# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Environment
NODE_PRODUCTION=dev  # or production
```

### 4. Setup Prisma

Generate Prisma Client:
```bash
npx prisma generate
```

Run database migrations:
```bash
npx prisma migrate dev --name init
```

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Authentication Flow

The system supports multiple authentication methods:

1. **Credentials Authentication**: Email/password-based login with secure password hashing
2. **OAuth Providers**: Google and GitHub authentication
3. **Session Management**: Secure session handling with NextAuth.js

## Database Schema

The application uses PostgreSQL with Prisma ORM. The schema includes:
- User management tables
- Session storage
- Account linking for OAuth providers
- Verification tokens

For detailed ERD, refer to the documentation.

## API Documentation

Complete API documentation and Postman collection available at:
[https://www.postman.com/ecommerce-website-0547/auth](https://www.postman.com/ecommerce-website-0547/auth)

## Logging System

Winston logger implementation with multiple log levels:
- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages

Logs include:
- Authentication attempts
- Validation failures
- Unhandled errors
- System events
- API interaction logs

Logs can be output to console, files, or external monitoring services.

## UI/UX Design

The interface follows modern design principles:
- **Minimalistic UI** - Clean and focused user experience
- **Responsive Layouts** - Mobile-first design approach
- **Accessibility** - WCAG-compliant form controls
- **Reusable Components** - Modular component architecture
- **Toast Notifications** - Real-time user feedback

## Project Structure

```
assignment/
├── prisma/                        # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
│
├── public/                        # Static assets (images, fonts)
│   └── ...
│
├── src/
│   ├── app/
│   │   ├── (auth)/                # Auth Routes Group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/             # Protected Dashboard Pages
│   │   │   ├── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                   # Next.js API Routes
│   │   │   ├── public/            # Public API (No Auth Required)
│   │   │   │   ├── health/
│   │   │   │   │   └── route.ts
│   │   │   │   └── info/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── auth/              # Auth API Routes
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   │
│   │   │   ├── protected/         # Protected API (JWT/Session Required)
│   │   │   │   ├── user/
│   │   │   │   │   └── route.ts
│   │   │   │   └── dashboard/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── route-handlers.ts  # (Optional) API middleware/utility
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing Page
│   │
│   ├── components/                # Reusable UI Components
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── ...
│   │
│   ├── lib/                       # Helpers, Utils, Config
│   │   ├── auth/
│   │   │   ├── hash.ts            # bcrypt hashing
│   │   │   ├── verify.ts          # verify password
│   │   │   └── session.ts         # next-auth / jwt helpers
│   │   ├── prisma.ts              # Prisma client
│   │   ├── logger.ts              # Winston logger
│   │   └── constants.ts
│   │
│   ├── hooks/                     # Custom Hooks
│   │   ├── useSession.ts
│   │   └── useAuth.ts
│   │
│   ├── styles/                    # Global CSS, Tailwind
│   │   ├── globals.css
│   │   └── theme.css
│   │
│   └── types/                     # TypeScript types/interfaces
│       ├── user.ts
│       ├── api.ts
│       └── auth.ts
│
├── .env                           # Environment variables
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json

```

## Future Enhancements

Potential extensions for this system:
- Role-based Access Control (RBAC)
- Admin dashboards
- Additional OAuth providers
- Advanced audit logging
- User management modules
- Two-factor authentication
- Password reset functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please refer to the project documentation or open an issue in the repository.

---

**Version:** 0.1.0  
**Prepared For:** Developers / Administrators