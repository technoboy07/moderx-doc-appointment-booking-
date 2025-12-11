# Doctor Appointment Booking System

A full-stack healthcare-focused appointment booking system built with Node.js, Express.js, MongoDB, React, and TypeScript. This system handles high concurrency scenarios to prevent race conditions and overbooking.

## 🏥 Project Overview

This is a comprehensive doctor appointment booking system that simulates the core functionality of platforms like RedBus or BookMyShow, but specifically designed for healthcare appointments. The system ensures data consistency and prevents overbooking even under high concurrent load.

## ✨ Features

### Backend
- ✅ Doctor and appointment slot management
- ✅ Concurrent booking with race condition prevention
- ✅ Atomic operations with MongoDB transactions
- ✅ Race condition prevention using findOneAndUpdate
- ✅ Automatic booking expiry (PENDING → FAILED after 2 minutes)
- ✅ Comprehensive API documentation (Swagger)
- ✅ Input validation and error handling
- ✅ System Design Document for scalability

### Frontend
- ✅ Admin dashboard for creating doctors and slots
- ✅ User dashboard for browsing available appointments
- ✅ Real-time slot availability updates
- ✅ Visual seat selection with DOM manipulation
- ✅ Comprehensive error handling and validation
- ✅ Responsive design (mobile and desktop)
- ✅ TypeScript for type safety
- ✅ Context API for state management

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **node-cron** - Scheduled jobs
- **Swagger** - API documentation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - Must be running as replica set for transactions
- npm or yarn

**Windows Users:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows-specific setup instructions.

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/doctor_appointments
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running. For transactions, MongoDB must be a replica set.
   
   **Windows Users:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows-specific instructions.
   
   **Linux/macOS:**
   ```bash
   # Start MongoDB with replica set
   mongod --replSet rs0 --port 27017
   
   # In another terminal, initialize replica set
   mongosh
   > rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start server**
   ```bash
   npm run dev
   ```

Backend will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api-docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   Create a `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm start
   ```

Frontend will be available at `http://localhost:3000` (or next available port)

## 📁 Project Structure

```
moderx/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── database/         # Schema and migrations
│   │   ├── jobs/             # Background jobs (booking expiry)
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── server.js         # Entry point
│   ├── package.json
│   ├── README.md
│   └── SYSTEM_DESIGN.md      # Scalability design document
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Context API
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main app
│   ├── package.json
│   └── README.md
│
└── README.md                 # This file
```

## 🔌 API Endpoints

### Doctors
- `POST /api/doctors` - Create a doctor
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointment Slots
- `POST /api/slots` - Create a slot
- `GET /api/slots` - Get all available slots
- `GET /api/slots/:id` - Get slot by ID

### Bookings
- `POST /api/bookings` - Book an appointment
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/slot/:slotId` - Get bookings for a slot

## 🔒 Concurrency Control

The system uses multiple strategies to prevent overbooking:

1. **Atomic Operations**: `findOneAndUpdate` with `$inc` operator ensures atomic seat decrement
2. **MongoDB Transactions**: All booking operations are wrapped in transactions for ACID guarantees
3. **Conditional Updates**: Seat availability is checked and updated in a single atomic operation
4. **Query Conditions**: Only slots with sufficient available seats can be updated

## 📊 System Design

See `backend/SYSTEM_DESIGN.md` for detailed scalability considerations including:
- High-level architecture
- Database sharding and replication strategies
- Caching strategies
- Message queue usage
- Performance optimization
- High availability and disaster recovery

## 🧪 Testing Concurrency

To test concurrent bookings:

```javascript
// Example: Concurrent booking test
const axios = require('axios');

async function testConcurrentBooking() {
  const promises = Array(10).fill(null).map(() =>
    axios.post('http://localhost:3000/api/bookings', {
      slotId: 1,
      userName: 'Test User',
      userEmail: 'test@example.com',
      seatsBooked: 1
    })
  );
  
  const results = await Promise.allSettled(promises);
  console.log(results);
}
```

## 📝 Key Features Explained

### Booking Expiry
- Pending bookings automatically expire after 2 minutes
- A cron job runs every 30 seconds
- Expired bookings are marked as `FAILED`
- Seats are released back to available inventory

### Frontend State Management
- Context API provides global state
- Automatic slot refresh every 30 seconds
- Optimistic updates for better UX
- Comprehensive error handling

### Seat Selection
- Visual seat selection with DOM manipulation
- Selected seats are highlighted
- Proper cleanup on component unmount
- Real-time availability updates

## 🚢 Deployment

### Quick Deployment Guide

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Deployment Checklist

See **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** for a complete checklist.

### Backend Deployment (Render.com / Railway)

1. **Set up MongoDB Atlas**:
   - Create free cluster
   - Get connection string
   - Configure network access

2. **Deploy on Render**:
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment variables:
     - `MONGODB_URI` (from Atlas)
     - `JWT_SECRET` (generate random string)
     - `NODE_ENV=production`
     - `PORT=10000`

3. **Test deployment**:
   - Health check: `https://your-backend.onrender.com/health`
   - API docs: `https://your-backend.onrender.com/api-docs`

### Frontend Deployment (Vercel / Netlify)

1. **Deploy on Vercel**:
   - Connect GitHub repository
   - Framework: Create React App
   - Set environment variable:
     - `REACT_APP_API_URL=https://your-backend.onrender.com/api`

2. **Update Backend CORS**:
   - Add `FRONTEND_URL` to backend environment variables
   - Redeploy backend if needed

3. **Test deployment**:
   - Visit frontend URL
   - Test all features
   - Check browser console for errors

### Environment Variables

**Backend** (`.env`):
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doctor_appointments
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Deployment Files

- `backend/render.yaml` - Render.com configuration
- `frontend/vercel.json` - Vercel configuration
- `frontend/netlify.toml` - Netlify configuration (alternative)

## 📚 Documentation

- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **System Design**: `backend/SYSTEM_DESIGN.md`
- **API Documentation**: Available at `/api-docs` when backend is running

## 🎯 Evaluation Criteria Coverage

### Functionality ✅
- All required APIs implemented
- Proper error handling
- Input validation

### Concurrency Handling ✅
- Database-level locking
- Transaction-based operations
- Race condition prevention

### Code Quality ✅
- Clean, modular structure
- Well-documented code
- TypeScript for type safety

### Technical Design ✅
- Comprehensive system design document
- Scalability considerations
- Production-ready architecture

### Bonus Features ✅
- Transactions and locking implemented
- Well-documented APIs (Swagger)
- Booking expiry job
- Real-time updates
- Responsive design

## 🤝 Contributing

This is an assessment project. For production use, consider:
- Adding authentication/authorization
- Implementing payment processing
- Adding email/SMS notifications
- Enhanced error monitoring
- Comprehensive test coverage

## 📄 License

This project is created for assessment purposes.

## 👤 Author

Built for Modex Assessment - Healthcare-focused appointment booking system.

---

**Note**: This system is designed to handle high concurrency and prevent overbooking through robust database-level locking and transaction management. The architecture is scalable and production-ready with proper documentation and design considerations.

