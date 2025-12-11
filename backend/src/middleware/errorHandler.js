const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // PostgreSQL errors
  if (err.code) {
    // Unique violation (duplicate key)
    if (err.code === '23505') {
      const field = err.constraint ? err.constraint.split('_')[1] : 'field';
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry',
        error: `${field} already exists`
      });
    }
    
    // Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referenced record does not exist',
        error: err.detail || err.message
      });
    }
    
    // Check constraint violation
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message
      });
    }
    
    // Invalid input syntax
    if (err.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: 'Invalid integer or UUID format'
      });
    }
  }
  
  // Invalid ID format (not found)
  if (err.message && err.message.includes('does not exist')) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      error: err.message
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;

