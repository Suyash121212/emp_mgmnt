const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { AppError } = require('../middleware/errorHandler');

const validateEmployeeAssignment = (employee, startDate) => {
  if (!employee) {
    throw new AppError('Assigned employee not found', 404);
  }
  if (employee.status === 'Inactive') {
    throw new AppError('Cannot assign tasks to an Inactive employee', 400);
  }
  if (employee.status === 'On Leave' && employee.leaveStart && employee.leaveEnd) {
    const taskStart = new Date(startDate);
    const leaveStart = new Date(employee.leaveStart);
    const leaveEnd = new Date(employee.leaveEnd);
    if (taskStart >= leaveStart && taskStart <= leaveEnd) {
      throw new AppError('Cannot assign task starting during employee leave period', 400);
    }
  }
};

const buildTaskFilter = (query = {}) => {
  const filter = {};

  if (query.department) {
    filter.department = query.department;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.assignedEmployee) {
    filter.assignedEmployee = query.assignedEmployee;
  }

  if (query.dueDateFrom || query.dueDateTo) {
    filter.dueDate = {};
    if (query.dueDateFrom) {
      filter.dueDate.$gte = new Date(query.dueDateFrom);
    }
    if (query.dueDateTo) {
      filter.dueDate.$lte = new Date(query.dueDateTo);
    }
  }

  const searchTerm = query.search || query.title;
  if (searchTerm && searchTerm.trim() !== '') {
    const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { 'employeeSnapshot.fullName': searchRegex },
      { taskId: searchRegex }
    ];
  }

  return filter;
};

const createTask = async (data) => {
  const employee = await Employee.findById(data.assignedEmployee);
  if (!employee) {
    throw new AppError('Assigned employee not found', 404);
  }

  validateEmployeeAssignment(employee, data.startDate);

  // Atomic capacity check and increment
  const updatedEmployee = await Employee.findOneAndUpdate(
    { _id: data.assignedEmployee, activeTaskCount: { $lt: 3 } },
    { $inc: { activeTaskCount: 1 } },
    { new: true }
  );

  if (!updatedEmployee) {
    throw new AppError('Employee already has maximum allowed active tasks (3)', 400);
  }

  try {
    const taskData = {
      title: data.title,
      description: data.description || '',
      assignedEmployee: employee._id,
      employeeSnapshot: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email
      },
      department: data.department,
      priority: data.priority,
      status: 'Todo',
      startDate: data.startDate,
      dueDate: data.dueDate
    };

    const task = await Task.create(taskData);
    await task.populate('assignedEmployee');
    return task;
  } catch (error) {
    // Rollback capacity increment on failure
    await Employee.findByIdAndUpdate(data.assignedEmployee, {
      $inc: { activeTaskCount: -1 }
    });
    throw error;
  }
};

const updateTask = async (id, data) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.status === 'Completed' || task.status === 'Cancelled') {
    throw new AppError(`Cannot edit task with status '${task.status}'`, 400);
  }

  if (data.status !== undefined) {
    throw new AppError('Status cannot be updated through this endpoint. Use PUT /api/tasks/:id/status', 400);
  }

  const targetStartDate = data.startDate || task.startDate;
  const targetDueDate = data.dueDate || task.dueDate;

  if (new Date(targetDueDate) < new Date(targetStartDate)) {
    throw new AppError('Due date must be on or after start date', 400);
  }

  const isReassigning =
    data.assignedEmployee &&
    data.assignedEmployee.toString() !== task.assignedEmployee.toString();

  if (isReassigning) {
    const newEmployee = await Employee.findById(data.assignedEmployee);
    if (!newEmployee) {
      throw new AppError('Assigned employee not found', 404);
    }

    validateEmployeeAssignment(newEmployee, targetStartDate);

    // Atomically increment new employee activeTaskCount
    const updatedNewEmployee = await Employee.findOneAndUpdate(
      { _id: data.assignedEmployee, activeTaskCount: { $lt: 3 } },
      { $inc: { activeTaskCount: 1 } },
      { new: true }
    );

    if (!updatedNewEmployee) {
      throw new AppError('Assigned employee already has maximum allowed active tasks (3)', 400);
    }

    // Decrement old employee activeTaskCount
    if (task.assignedEmployee) {
      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });
    }

    task.assignedEmployee = updatedNewEmployee._id;
    task.employeeSnapshot = {
      employeeId: updatedNewEmployee.employeeId,
      fullName: updatedNewEmployee.fullName,
      email: updatedNewEmployee.email
    };
  } else if (data.startDate) {
    const currentEmployee = await Employee.findById(task.assignedEmployee);
    if (currentEmployee) {
      validateEmployeeAssignment(currentEmployee, targetStartDate);
    }
  }

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.department !== undefined) task.department = data.department;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.startDate !== undefined) task.startDate = data.startDate;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;

  await task.save();
  await task.populate('assignedEmployee');
  return task;
};

const updateTaskStatus = async (id, newStatus) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const allowedTransitions = {
    Todo: ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Cancelled']
  };

  const allowed = allowedTransitions[task.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from '${task.status}' to '${newStatus}'. Allowed transitions: ${allowed ? allowed.join(', ') : 'None'}`,
      400
    );
  }

  if (newStatus === 'Completed') {
    task.completedDate = new Date();
  }

  // Decrement employee activeTaskCount if moving to terminal status
  if (['Completed', 'Cancelled'].includes(newStatus) && ['Todo', 'In Progress'].includes(task.status)) {
    if (task.assignedEmployee) {
      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });
    }
  }

  task.status = newStatus;
  await task.save();
  await task.populate('assignedEmployee');
  return task;
};

const deleteTask = async (id) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (['Todo', 'In Progress'].includes(task.status)) {
    if (task.assignedEmployee) {
      await Employee.findByIdAndUpdate(task.assignedEmployee, {
        $inc: { activeTaskCount: -1 }
      });
    }
  }

  await Task.findByIdAndDelete(id);
  return { id: task._id, taskId: task.taskId, message: 'Task deleted successfully' };
};

const getTasks = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = buildTaskFilter(query);
  const total = await Task.countDocuments(filter);

  let tasks;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  if (sortBy === 'priority') {
    const aggregateIds = await Task.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                { case: { $eq: ['$priority', 'High'] }, then: 3 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'Low'] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { priorityWeight: sortOrder, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 1 } }
    ]);

    const ids = aggregateIds.map((item) => item._id);
    const populatedTasks = await Task.find({ _id: { $in: ids } }).populate('assignedEmployee');
    const taskMap = new Map(populatedTasks.map((t) => [t._id.toString(), t]));
    tasks = ids.map((id) => taskMap.get(id.toString())).filter(Boolean);
  } else {
    tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('assignedEmployee');
  }

  const pages = Math.ceil(total / limit) || 1;

  return {
    tasks,
    total,
    page,
    pages
  };
};

const getTasksForExport = async (query = {}) => {
  const filter = buildTaskFilter(query);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  let tasks;
  if (sortBy === 'priority') {
    const aggregateIds = await Task.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                { case: { $eq: ['$priority', 'High'] }, then: 3 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'Low'] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { priorityWeight: sortOrder, createdAt: -1 } },
      { $project: { _id: 1 } }
    ]);

    const ids = aggregateIds.map((item) => item._id);
    const populatedTasks = await Task.find({ _id: { $in: ids } }).populate('assignedEmployee');
    const taskMap = new Map(populatedTasks.map((t) => [t._id.toString(), t]));
    tasks = ids.map((id) => taskMap.get(id.toString())).filter(Boolean);
  } else {
    tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate('assignedEmployee');
  }

  // Ensure isOverdue virtual is serialized
  return tasks.map((task) => (task.toJSON ? task.toJSON() : task));
};

const getTaskById = async (id) => {
  const task = await Task.findById(id).populate('assignedEmployee');
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

module.exports = {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasks,
  getTasksForExport,
  getTaskById
};
