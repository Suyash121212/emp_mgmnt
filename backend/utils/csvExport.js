const { Parser } = require('json2csv');

const exportTasksToCsv = (tasks) => {
  const fields = [
    { label: 'Task ID', value: 'taskId' },
    { label: 'Title', value: 'title' },
    { label: 'Assigned Employee Name', value: 'employeeSnapshot.fullName' },
    { label: 'Assigned Employee ID', value: 'employeeSnapshot.employeeId' },
    { label: 'Department', value: 'department' },
    { label: 'Priority', value: 'priority' },
    { label: 'Status', value: 'status' },
    {
      label: 'Start Date',
      value: (row) => (row.startDate ? new Date(row.startDate).toISOString().split('T')[0] : '')
    },
    {
      label: 'Due Date',
      value: (row) => (row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : '')
    },
    {
      label: 'Completed Date',
      value: (row) => (row.completedDate ? new Date(row.completedDate).toISOString().split('T')[0] : '')
    },
    {
      label: 'Is Overdue',
      value: (row) => (row.isOverdue ? 'true' : 'false')
    },
    {
      label: 'Created At',
      value: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : '')
    }
  ];

  const parser = new Parser({ fields });
  return parser.parse(tasks);
};

module.exports = {
  exportTasksToCsv
};
