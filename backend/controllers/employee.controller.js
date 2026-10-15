const asyncHandler = require('../middleware/asyncHandler');
const employeeService = require('../services/employee.service');

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee
  });
});

const getEmployees = asyncHandler(async (req, res) => {
  const result = await employeeService.getEmployees(req.query);
  res.status(200).json({
    success: true,
    message: 'Employees retrieved successfully',
    data: result
  });
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Employee retrieved successfully',
    data: employee
  });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const result = await employeeService.deleteEmployee(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully',
    data: result
  });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
