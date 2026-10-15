export const DEPARTMENTS = [
  'Development',
  'Design',
  'QA',
  'HR',
  'Sales',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

export const VALID_STATUS_TRANSITIONS = {
  'Todo': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
};

export const STATUS_COLORS = {
  'Todo': {
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500',
    text: 'text-gray-700',
    border: 'border-gray-400',
  },
  'In Progress': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-400',
  },
  'Completed': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-400',
  },
  'Cancelled': {
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-400',
  },
};

export const EMPLOYEE_STATUS_COLORS = {
  'Active': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  'Inactive': {
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
  },
  'On Leave': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
};

export const PRIORITY_COLORS = {
  'Low': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  'Medium': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  'High': {
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
  'Urgent': {
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
};
