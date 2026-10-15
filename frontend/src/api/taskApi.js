import api from './axios';

/**
 * Fetch paginated tasks with filters and search.
 * @param {object} params - { page, limit, search, department, priority, status, dueDateFrom, dueDateTo, sortBy, sortOrder, assignedEmployee }
 */
export const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

/**
 * Fetch single task details by ID.
 * @param {string} id 
 */
export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task.
 * @param {object} data - { title, assignedEmployee, department, priority, startDate, dueDate, description }
 */
export const createTask = async (data) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

/**
 * Update task details (excludes status).
 * @param {string} id 
 * @param {object} data - { title, assignedEmployee, department, priority, startDate, dueDate, description }
 */
export const updateTask = async (id, data) => {
  // Ensure status is never sent in general task update
  const { status, ...allowedData } = data;
  const response = await api.put(`/tasks/${id}`, allowedData);
  return response.data;
};

/**
 * Update task status explicitly.
 * @param {string} id 
 * @param {string} status 
 */
export const updateTaskStatus = async (id, status) => {
  const response = await api.put(`/tasks/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a task by ID.
 * @param {string} id 
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Export tasks matching current filter criteria as a CSV file.
 * @param {object} params - { search, department, priority, status, dueDateFrom, dueDateTo }
 */
export const exportTasksCsv = async (params = {}) => {
  // Strip page and limit from export params to export all matching records
  const { page, limit, ...exportParams } = params;

  const response = await api.get('/tasks/export/csv', {
    params: exportParams,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `tasks_export_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return response.data;
};
