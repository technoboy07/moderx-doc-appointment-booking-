# Doctor Appointment Booking System - Backend

A robust, scalable backend API for managing doctor appointments with advanced concurrency control to prevent overbooking.

## Features

- ✅ Doctor and appointment slot management
- ✅ Concurrent booking with race condition prevention
- ✅ Atomic operations with MongoDB transactions
- ✅ Race condition prevention using findOneAndUpdate
- ✅ Automatic booking expiry (PENDING → FAILED after 2 minutes)
- ✅ Comprehensive API documentation (Swagger)
- ✅ Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **node-cron** - Scheduled jobs for booking expiry

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - MongoDB must be running as a replica set for transactions
- npm or yarn

**Windows Users:** See [WINDOWS_SETUP.md](../WINDOWS_SETUP.md) for detailed Windows-specific setup instructions.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctor_appointments
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows Users:** See [WINDOWS_SETUP.md](../WINDOWS_SETUP.md) for detailed Windows-specific instructions.

**Linux/macOS:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

**Important**: For transactions to work, MongoDB must be running as a replica set (even single-node). To set up a single-node replica set:

```bash
# Start MongoDB with replica set
mongod --replSet rs0 --port 27017

# In another terminal, initialize replica set
mongosh
> rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This will create a sample doctor for testing.

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs

## API Endpoints

### Doctors

- `POST /api/doctors` - Create a new doctor
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointment Slots

- `POST /api/slots` - Create a new appointment slot
- `GET /api/slots` - Get all available slots
- `GET /api/slots/:id` - Get slot by ID

### Bookings

- `POST /api/bookings` - Book an appointment
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/slot/:slotId` - Get all bookings for a slot

## Example API Calls

### Create a Doctor

```bash
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Doe",
    "specialization": "Cardiology"
  }'
```

### Create an Appointment Slot

```bash
curl -X POST http://localhost:3000/api/slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": 1,
    "startTime": "2024-12-25T10:00:00Z",
    "totalSeats": 5
  }'
```

### Book an Appointment

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": 1,
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "seatsBooked": 1
  }'
```

## Concurrency Control

The system uses multiple strategies to prevent overbooking:

1. **Atomic Operations**: `findOneAndUpdate` with `$inc` operator ensures atomic seat decrement
2. **MongoDB Transactions**: All booking operations are wrapped in transactions for ACID guarantees
3. **Conditional Updates**: Seat availability is checked and updated in a single atomic operation
4. **Query Conditions**: Only slots with sufficient available seats can be updated

## Booking Expiry

Pending bookings automatically expire after 2 minutes:
- A cron job runs every 30 seconds
- Expired bookings are marked as `FAILED`
- Seats are released back to available inventory

## Database Schema

MongoDB collections with Mongoose schemas:

- **doctors**: Doctor information
- **appointment_slots**: Available appointment slots with seat counts (references doctors)
- **bookings**: User bookings with status (PENDING, CONFIRMED, FAILED) (references appointment_slots)

All collections use MongoDB ObjectIds as primary keys and include timestamps (createdAt, updatedAt).

## Testing Concurrency

To test concurrent bookings, you can use tools like Apache Bench or write a simple script:

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

## Architecture Decisions

- **Row-level locking** ensures no two transactions can book the same seats simultaneously
- **Transactions** guarantee atomicity - either all operations succeed or none do
- **Indexes** on frequently queried columns improve performance
- **Cron jobs** handle background tasks without blocking the main application

## Production Considerations

See `SYSTEM_DESIGN.md` for detailed scalability and production considerations.

