const express = require('express');
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employee.controller');

const {
  validateCreateEmployee,
  validateUpdateEmployee
} = require('../validators/employee.validator');

router
  .route('/')
  .get(getEmployees)
  .post(validateCreateEmployee, createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(validateUpdateEmployee, updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
