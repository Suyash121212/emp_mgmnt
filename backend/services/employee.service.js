const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');

const createEmployee = async (data) => {
  const existingEmployeeId = await Employee.findOne({ employeeId: data.employeeId });
  if (existingEmployeeId) {
    throw new AppError('Employee ID already exists', 409);
  }

  const existingEmail = await Employee.findOne({ email: data.email.toLowerCase() });
  if (existingEmail) {
    throw new AppError('Email already exists', 409);
  }

  if (data.status === 'On Leave') {
    if (!data.leaveStart || !data.leaveEnd) {
      throw new AppError('Leave start and end dates are required when status is On Leave', 400);
    }
    if (new Date(data.leaveEnd) < new Date(data.leaveStart)) {
      throw new AppError('Leave end date must be on or after leave start date', 400);
    }
  }

  const employee = await Employee.create(data);
  return employee;
};

const updateEmployee = async (id, data) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (data.email && data.email.toLowerCase() !== employee.email) {
    const existingEmail = await Employee.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (existingEmail) {
      throw new AppError('Email already in use by another employee', 409);
    }
  }

  if (data.employeeId && data.employeeId !== employee.employeeId) {
    const existingEmpId = await Employee.findOne({ employeeId: data.employeeId, _id: { $ne: id } });
    if (existingEmpId) {
      throw new AppError('Employee ID already in use by another employee', 409);
    }
  }

  // Handle leave date logic on status changes
  const targetStatus = data.status !== undefined ? data.status : employee.status;
  if (targetStatus === 'On Leave') {
    const leaveStart = data.leaveStart !== undefined ? data.leaveStart : employee.leaveStart;
    const leaveEnd = data.leaveEnd !== undefined ? data.leaveEnd : employee.leaveEnd;
    if (!leaveStart || !leaveEnd) {
      throw new AppError('Leave start and end dates are required when status is On Leave', 400);
    }
    if (new Date(leaveEnd) < new Date(leaveStart)) {
      throw new AppError('Leave end date must be on or after leave start date', 400);
    }
  } else if (employee.status === 'On Leave' && targetStatus !== 'On Leave') {
    // If status changing away from 'On Leave', clear leaveStart/leaveEnd
    data.leaveStart = null;
    data.leaveEnd = null;
  }

  Object.keys(data).forEach((key) => {
    if (key !== '_id' && key !== 'activeTaskCount') {
      employee[key] = data[key];
    }
  });

  await employee.save();
  return employee;
};

const deleteEmployee = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  const activeTasksCount = await Task.countDocuments({
    assignedEmployee: id,
    status: { $in: ['Todo', 'In Progress'] }
  });

  if (activeTasksCount > 0) {
    throw new AppError('Cannot delete employee with active tasks (Todo or In Progress)', 400);
  }

  await Employee.findByIdAndDelete(id);
  return { id: employee._id, employeeId: employee.employeeId };
};

const getEmployees = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};

  const searchTerm = query.search || query.fullName;
  if (searchTerm && searchTerm.trim() !== '') {
    filter.fullName = { $regex: searchTerm.trim(), $options: 'i' };
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [total, employees] = await Promise.all([
    Employee.countDocuments(filter),
    Employee.find(filter).sort(sort).skip(skip).limit(limit)
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    employees,
    total,
    page,
    pages
  };
};

const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployees,
  getEmployeeById
};
