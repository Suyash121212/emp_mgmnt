const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv
} = require('../controllers/task.controller');

const {
  validateCreateTask,
  validateUpdateTask,
  validateStatusUpdate
} = require('../validators/task.validator');

// Export CSV route must be defined before parameterized :id route
router.get('/export/csv', exportTasksCsv);

router
  .route('/')
  .get(getTasks)
  .post(validateCreateTask, createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(validateUpdateTask, updateTask)
  .delete(deleteTask);

router.put('/:id/status', validateStatusUpdate, updateTaskStatus);

module.exports = router;
