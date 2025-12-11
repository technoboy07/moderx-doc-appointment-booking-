import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import expirePendingBookings from './jobs/bookingExpiry.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow frontend URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  // Add your deployed frontend URLs here
  // 'https://your-frontend.vercel.app',
  // 'https://your-frontend.netlify.app',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now - restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Doctor Appointment Booking API',
      version: '1.0.0',
      description: 'API for managing doctor appointments with concurrency control',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: [join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start booking expiry job (runs every 30 seconds)
cron.schedule('*/30 * * * * *', async () => {
  try {
    await expirePendingBookings();
  } catch (error) {
    console.error('Error in booking expiry cron job:', error);
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

