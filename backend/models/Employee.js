const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Development', 'Design', 'QA', 'HR', 'Sales'],
        message: '{VALUE} is not a valid department'
      }
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Active', 'Inactive', 'On Leave'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Active'
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    leaveStart: {
      type: Date
    },
    leaveEnd: {
      type: Date
    },
    activeTaskCount: {
      type: Number,
      default: 0,
      min: [0, 'Active task count cannot be negative']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
