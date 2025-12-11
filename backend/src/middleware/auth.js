import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory user store (in production, use database)
const users = [
  {
    id: '1',
    email: 'admin@doctorapp.com',
    password: 'admin123', // In production, use hashed passwords
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'user@doctorapp.com',
    password: 'user123',
    role: 'user',
    name: 'Regular User'
  }
];

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authenticate user and return token
const authenticateUser = async (email, password) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return null;
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  };
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};

export {
  authenticateUser,
  authenticateToken,
  requireAdmin
};

