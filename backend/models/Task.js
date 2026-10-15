const mongoose = require('mongoose');
const Counter = require('./Counter');

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: [true, 'Task ID is required'],
      unique: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned employee is required']
    },
    employeeSnapshot: {
      employeeId: { type: String, default: '' },
      fullName: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Development', 'Design', 'QA', 'HR', 'Sales'],
        message: '{VALUE} is not a valid department'
      }
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority'
      }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Todo', 'In Progress', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Todo'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    completedDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

taskSchema.index({ taskId: 1 }, { unique: true });
taskSchema.index({ assignedEmployee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ department: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  if (!this.dueDate) {
    return false;
  }
  return new Date(this.dueDate) < new Date();
});

taskSchema.pre('validate', async function (next) {
  if (this.isNew && !this.taskId) {
    try {
      const seq = await Counter.getNextSequence('taskId');
      this.taskId = `TSK-${String(seq).padStart(3, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
