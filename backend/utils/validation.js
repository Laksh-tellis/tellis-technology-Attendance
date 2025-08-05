/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid, missingFields, and message
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return {
    isValid: true,
    missingFields: [],
    message: 'All required fields are present'
  };
};

/**
 * Validate date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} Validation result
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      message: 'Invalid date format'
    };
  }

  if (start > end) {
    return {
      isValid: false,
      message: 'Start date must be before end date'
    };
  }

  return {
    isValid: true,
    message: 'Date range is valid'
  };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Validation result
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return {
      isValid: false,
      message: 'Page must be a positive number'
    };
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return {
      isValid: false,
      message: 'Limit must be between 1 and 100'
    };
  }

  return {
    isValid: true,
    message: 'Pagination parameters are valid'
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .replace(/["]/g, '&quot;') // Escape quotes
    .replace(/[']/g, '&#x27;') // Escape single quotes
    .replace(/[/]/g, '&#x2F;'); // Escape forward slashes
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate activity type
 * @param {string} type - Activity type to validate
 * @returns {boolean}
 */
const isValidActivityType = (type) => {
  const validTypes = [
    'LOGIN',
    'LOGOUT',
    'SCREENSHOT',
    'IDLE',
    'ACTIVE',
    'BREAK',
    'MEETING',
    'TASK_START',
    'TASK_END'
  ];
  return validTypes.includes(type);
};

/**
 * Validate user role
 * @param {string} role - User role to validate
 * @returns {boolean}
 */
const isValidUserRole = (role) => {
  const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
  return validRoles.includes(role);
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateRequiredFields,
  validateDateRange,
  validatePagination,
  sanitizeString,
  isValidUUID,
  isValidActivityType,
  isValidUserRole
}; 