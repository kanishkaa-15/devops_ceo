# MongoDB Integration Setup Guide

## Prerequisites
1. **Docker & Docker Compose**: Ensure Docker is installed and running on your system.

## Quick Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database (First Time Only)
```bash
npm run seed
```

### 3. Start Servers
```bash
# From project root
start-servers.bat
```

## Database Collections Created

### Users Collection
- **admin@school.edu** / admin123 (Admin role)
- **ceo@school.edu** / ceo123 (CEO role)

### Staff Collection
- Sample staff members with departments and positions

### Admissions Collection  
- Sample student applications with status tracking

### Queries Collection
- Sample parent queries with priority levels

## Environment Variables
Located in `backend/.env`:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Backend server port (default: 5000)

## API Endpoints
All endpoints now use MongoDB for data persistence:
- Authentication with JWT tokens
- Password hashing with bcrypt
- Real-time analytics from database

## Troubleshooting
1. **MongoDB Connection Error**: Ensure MongoDB service is running
2. **Port 27017 in use**: Check if MongoDB is already running
3. **Seed script fails**: Verify MongoDB connection and permissions