# Quick Start Guide

Get your Employee Monitoring System backend running in 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js 16+ installed
- PostgreSQL installed and running
- Git installed

### 2. Clone and Setup
```bash
# Navigate to backend directory
cd backend

# Run the setup script
npm run setup
```

### 3. Configure Database
```bash
# Create PostgreSQL database
createdb employee_monitoring

# Update .env file with your database credentials
# Edit DATABASE_URL in .env file:
# DATABASE_URL="postgresql://username:password@localhost:5432/employee_monitoring?schema=public"
```

### 4. Initialize Database
```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 5. Start Server
```bash
# Start development server
npm run dev
```

Your server will be running at `http://localhost:5000`

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!"
  }'
```

### 4. Test Protected Endpoint
```bash
# Use the token from login response
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 API Testing with Postman

1. Import this collection:
```json
{
  "info": {
    "name": "Employee Monitoring API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/health"
      }
    },
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/register",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@company.com\",\n  \"password\": \"Admin123!\",\n  \"firstName\": \"Admin\",\n  \"lastName\": \"User\",\n  \"role\": \"ADMIN\"\n}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@company.com\",\n  \"password\": \"Admin123!\"\n}"
        }
      }
    }
  ]
}
```

## 🔧 Common Issues

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `createdb employee_monitoring`

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 5000: `lsof -ti:5000 | xargs kill`

### Prisma Errors
- Run: `npm run db:generate`
- Run: `npm run db:push`
- Check database connection

## 📱 Next Steps

1. **Frontend Integration**: Connect your React dashboard
2. **Electron Agent**: Set up the monitoring agent
3. **Production**: Deploy to your server
4. **Monitoring**: Set up logging and monitoring

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in the README
- Check the console for error messages
- Ensure all environment variables are set correctly 