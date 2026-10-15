const Joi = require('joi');

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const createEmployeeSchema = Joi.object({
  employeeId: Joi.string().trim().required().messages({
    'any.required': 'Employee ID is required',
    'string.empty': 'Employee ID cannot be empty'
  }),
  fullName: Joi.string().trim().required().messages({
    'any.required': 'Full name is required',
    'string.empty': 'Full name cannot be empty'
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  phone: Joi.string().trim().required().messages({
    'any.required': 'Phone number is required',
    'string.empty': 'Phone number cannot be empty'
  }),
  department: Joi.string().valid(...DEPARTMENTS).required().messages({
    'any.required': 'Department is required',
    'any.only': `Department must be one of: ${DEPARTMENTS.join(', ')}`
  }),
  role: Joi.string().trim().required().messages({
    'any.required': 'Role is required',
    'string.empty': 'Role cannot be empty'
  }),
  joiningDate: Joi.date().iso().required().messages({
    'any.required': 'Joining date is required'
  }),
  status: Joi.string().valid(...STATUSES).default('Active'),
  skills: Joi.array().items(Joi.string().trim()).default([]),
  leaveStart: Joi.date().iso().when('status', {
    is: 'On Leave',
    then: Joi.date().iso().required().messages({
      'any.required': 'Leave start date is required when status is On Leave'
    }),
    otherwise: Joi.optional().allow(null, '')
  }),
  leaveEnd: Joi.date().iso().when('status', {
    is: 'On Leave',
    then: Joi.date().iso().min(Joi.ref('leaveStart')).required().messages({
      'any.required': 'Leave end date is required when status is On Leave',
      'date.min': 'Leave end date must be on or after leave start date'
    }),
    otherwise: Joi.optional().allow(null, '')
  })
});

const updateEmployeeSchema = Joi.object({
  employeeId: Joi.string().trim(),
  fullName: Joi.string().trim(),
  email: Joi.string().trim().email().lowercase(),
  phone: Joi.string().trim(),
  department: Joi.string().valid(...DEPARTMENTS),
  role: Joi.string().trim(),
  joiningDate: Joi.date().iso(),
  status: Joi.string().valid(...STATUSES),
  skills: Joi.array().items(Joi.string().trim()),
  leaveStart: Joi.date().iso().allow(null, ''),
  leaveEnd: Joi.date().iso().allow(null, '')
}).custom((value, helpers) => {
  if (value.status === 'On Leave') {
    if (!value.leaveStart) {
      return helpers.message('Leave start date is required when status is On Leave');
    }
    if (!value.leaveEnd) {
      return helpers.message('Leave end date is required when status is On Leave');
    }
    if (new Date(value.leaveEnd) < new Date(value.leaveStart)) {
      return helpers.message('Leave end date must be on or after leave start date');
    }
  }
  return value;
});

const validateCreateEmployee = (req, res, next) => {
  const { error, value } = createEmployeeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errorMessages
    });
  }
  req.body = value;
  next();
};

const validateUpdateEmployee = (req, res, next) => {
  const { error, value } = updateEmployeeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errorMessages
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateEmployee,
  validateUpdateEmployee
};
