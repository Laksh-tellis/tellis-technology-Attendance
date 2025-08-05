# Employee Monitoring System Backend

A comprehensive Node.js backend for employee monitoring with real-time activity tracking, productivity analytics, and secure authentication.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Employee Management**: CRUD operations for employee profiles
- **Activity Tracking**: Real-time activity monitoring and recording
- **Productivity Analytics**: Detailed productivity reports and analytics
- **Dashboard**: Real-time monitoring dashboard with statistics
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful API designed for both web dashboard and Electron agent

## 📋 Prerequisites

- Node.js (>= 16.0.0)
- PostgreSQL (>= 12.0)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/employee_monitoring?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb employee_monitoring
   
   # Initialize Prisma
   npx prisma generate
   npx prisma db push
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── controllers/          # Business logic and request handlers
│   ├── auth.controller.js
│   ├── employee.controller.js
│   ├── activity.controller.js
│   └── dashboard.controller.js
├── routes/              # API route definitions
│   ├── auth.router.js
│   ├── employee.router.js
│   ├── activity.router.js
│   └── dashboard.router.js
├── middlewares/         # Express middlewares
│   ├── authMiddleware.js
│   └── errorHandler.js
├── prisma/             # Database schema and migrations
│   └── schema.prisma
├── utils/              # Utility functions
│   ├── database.js
│   └── validation.js
├── jobs/               # Background job processors
│   └── activityProcessor.js
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── package.json
└── README.md
```

## 🔐 Authentication

The system uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Access to employee management and analytics
- **EMPLOYEE**: Basic access to own profile and activities

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees (paginated)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id/activity-summary` - Get employee activity summary

### Activities
- `POST /api/activities` - Record new activity
- `POST /api/activities/bulk` - Bulk record activities
- `GET /api/activities` - Get activities (filtered/paginated)
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity status
- `GET /api/activities/stats/summary` - Get activity statistics

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/productivity` - Get productivity analytics
- `GET /api/dashboard/monitoring` - Get real-time monitoring
- `GET /api/dashboard/health` - Get system health status

## 🗄️ Database Schema

### Users
- `id` (String, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `role` (Enum: ADMIN, MANAGER, EMPLOYEE)
- `isActive` (Boolean)
- `lastLoginAt` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Sessions
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `startTime` (DateTime)
- `endTime` (DateTime)
- `isActive` (Boolean)
- `ipAddress` (String)
- `userAgent` (String)
- `deviceInfo` (JSON)

### Activities
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `sessionId` (String, Foreign Key)
- `type` (Enum: LOGIN, LOGOUT, SCREENSHOT, IDLE, ACTIVE, BREAK, MEETING, TASK_START, TASK_END)
- `status` (Enum: PENDING, COMPLETED, FAILED)
- `description` (String)
- `metadata` (JSON)
- `timestamp` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Screenshots
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `sessionId` (String, Foreign Key)
- `imagePath` (String)
- `imageUrl` (String)
- `description` (String)
- `metadata` (JSON)
- `createdAt` (DateTime)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database with sample data
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL="postgresql://user:pass@host:port/db"
   JWT_SECRET="your-production-secret"
   ```

2. **Install dependencies**
   ```bash
   npm install --production
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers with helmet
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling

## 📈 Monitoring & Analytics

- **Real-time Activity Tracking**: Monitor employee activities in real-time
- **Productivity Analytics**: Detailed productivity reports
- **Session Management**: Track user sessions and device information
- **Dashboard Metrics**: Overview of system usage and performance
- **Activity Statistics**: Comprehensive activity analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository. 