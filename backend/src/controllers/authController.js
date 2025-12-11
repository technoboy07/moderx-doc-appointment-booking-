import { authenticateUser } from '../middleware/auth.js';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken middleware
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  login,
  getCurrentUser
};

