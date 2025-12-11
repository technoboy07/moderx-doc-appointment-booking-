# Doctor Appointment Booking System - Backend

A robust, scalable backend API for managing doctor appointments with advanced concurrency control to prevent overbooking.

## Features

- ✅ Doctor and appointment slot management
- ✅ Concurrent booking with race condition prevention
- ✅ Atomic operations with PostgreSQL transactions
- ✅ Race condition prevention using SELECT FOR UPDATE
- ✅ Automatic booking expiry (PENDING → FAILED after 2 minutes)
- ✅ Comprehensive API documentation (Swagger)
- ✅ Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **node-cron** - Scheduled jobs for booking expiry

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

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
DATABASE_URL=postgresql://postgres:password@localhost:5432/doctor_appointments
POSTGRESQL_URI=postgresql://postgres:password@localhost:5432/doctor_appointments
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start PostgreSQL

Make sure PostgreSQL is running on your system:

**Windows:**
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Start PostgreSQL service
- Create database: `createdb doctor_appointments`

**Linux/macOS:**
```bash
# On macOS with Homebrew
brew services start postgresql

# On Linux
sudo systemctl start postgresql

# Create database
createdb doctor_appointments
```

### 4. Initialize Database Schema

The schema will be automatically created when the backend starts. Alternatively, you can run:

```bash
psql -d doctor_appointments -f src/database/schema.sql
```

### 5. Seed Database (Optional)

```bash
npm run seed
```

This will create sample doctors for testing.

### 6. Start the Server

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

- `POST /api/doctors` - Create a new doctor (Admin only)
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointment Slots

- `POST /api/slots` - Create a new appointment slot (Admin only)
- `GET /api/slots` - Get all available slots
- `GET /api/slots/:id` - Get slot by ID

### Bookings

- `POST /api/bookings` - Book an appointment
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/slot/:slotId` - Get all bookings for a slot
- `GET /api/bookings/my-bookings` - Get user's bookings (Authenticated)
- `GET /api/bookings` - Get all bookings (Admin only)
- `DELETE /api/bookings/:id` - Cancel a booking (Authenticated, own bookings only)

### Authentication

- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (Authenticated)

## Example API Calls

### Create a Doctor

```bash
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Dr. Jane Doe",
    "specialization": "Cardiology"
  }'
```

### Create an Appointment Slot

```bash
curl -X POST http://localhost:3000/api/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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

1. **Row-Level Locking**: `SELECT FOR UPDATE` locks the slot row during booking
2. **PostgreSQL Transactions**: All booking operations are wrapped in transactions for ACID guarantees
3. **Atomic Updates**: Seat availability is checked and updated in a single atomic operation within a transaction
4. **Query Conditions**: Only slots with sufficient available seats can be updated
5. **Isolation Levels**: PostgreSQL's default isolation level ensures data consistency

## Booking Expiry

Pending bookings automatically expire after 2 minutes:
- A cron job runs every 30 seconds
- Expired bookings are marked as `FAILED`
- Seats are released back to available inventory

## Database Schema

PostgreSQL tables:

- **doctors**: Doctor information (id, name, specialization, timestamps)
- **appointment_slots**: Available appointment slots with seat counts (references doctors)
- **bookings**: User bookings with status (PENDING, CONFIRMED, FAILED) (references appointment_slots)

All tables use SERIAL (auto-incrementing integer) primary keys and include timestamps (created_at, updated_at).

## Testing Concurrency

To test concurrent bookings, you can use tools like Apache Bench or write a simple script:

```javascript
// Example: Concurrent booking test
import axios from 'axios';

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

- **Row-level locking** (SELECT FOR UPDATE) ensures no two transactions can book the same seats simultaneously
- **PostgreSQL Transactions** guarantee atomicity - either all operations succeed or none do
- **Indexes** on frequently queried columns improve performance
- **Cron jobs** handle background tasks without blocking the main application
- **Connection pooling** (pg Pool) manages database connections efficiently

## Production Considerations

See `SYSTEM_DESIGN.md` for detailed scalability and production considerations.
