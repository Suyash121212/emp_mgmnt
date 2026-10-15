const Joi = require('joi');

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const createTaskSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Task title is required',
    'string.empty': 'Task title cannot be empty'
  }),
  description: Joi.string().trim().allow('').default(''),
  assignedEmployee: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
    'any.required': 'Assigned employee is required',
    'string.pattern.base': 'Assigned employee must be a valid MongoDB ObjectId'
  }),
  department: Joi.string().valid(...DEPARTMENTS).required().messages({
    'any.required': 'Department is required',
    'any.only': `Department must be one of: ${DEPARTMENTS.join(', ')}`
  }),
  priority: Joi.string().valid(...PRIORITIES).required().messages({
    'any.required': 'Priority is required',
    'any.only': `Priority must be one of: ${PRIORITIES.join(', ')}`
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required'
  }),
  dueDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'any.required': 'Due date is required',
    'date.min': 'Due date must be on or after start date'
  }),
  status: Joi.string().optional() // New tasks always start as Todo, status is ignored/overridden in service
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim().allow(''),
  assignedEmployee: Joi.string().regex(OBJECT_ID_REGEX).messages({
    'string.pattern.base': 'Assigned employee must be a valid MongoDB ObjectId'
  }),
  department: Joi.string().valid(...DEPARTMENTS).messages({
    'any.only': `Department must be one of: ${DEPARTMENTS.join(', ')}`
  }),
  priority: Joi.string().valid(...PRIORITIES).messages({
    'any.only': `Priority must be one of: ${PRIORITIES.join(', ')}`
  }),
  startDate: Joi.date().iso(),
  dueDate: Joi.date().iso(),
  status: Joi.forbidden().messages({
    'any.unknown': 'Status cannot be updated through this endpoint. Use /api/tasks/:id/status'
  })
}).custom((value, helpers) => {
  if (value.startDate && value.dueDate && new Date(value.dueDate) < new Date(value.startDate)) {
    return helpers.message('Due date must be on or after start date');
  }
  return value;
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid(...STATUSES).required().messages({
    'any.required': 'Status is required',
    'any.only': `Status must be one of: ${STATUSES.join(', ')}`
  })
}).options({ stripUnknown: false });

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
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

const validateStatusUpdateMiddleware = (req, res, next) => {
  const { error, value } = statusUpdateSchema.validate(req.body, { abortEarly: false, allowUnknown: false });
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
  validateCreateTask: validate(createTaskSchema),
  validateUpdateTask: validate(updateTaskSchema),
  validateStatusUpdate: validateStatusUpdateMiddleware
};
