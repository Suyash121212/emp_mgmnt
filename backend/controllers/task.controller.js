const asyncHandler = require('../middleware/asyncHandler');
const taskService = require('../services/task.service');
const { exportTasksToCsv } = require('../utils/csvExport');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.query);
  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: result
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: task
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: task
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: result
  });
});

const exportTasksCsv = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksForExport(req.query);
  const csvData = exportTasksToCsv(tasks);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
  res.status(200).send(csvData);
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv
};
