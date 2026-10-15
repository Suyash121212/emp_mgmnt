import api from './axios';

/**
 * Fetch paginated employees with query filters.
 * @param {object} params - { page, limit, search, department, status, sortBy, sortOrder }
 */
export const getEmployees = async (params = {}) => {
  const response = await api.get('/employees', { params });
  return response.data;
};

/**
 * Fetch a single employee by their ID.
 * @param {string} id 
 */
export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

/**
 * Create a new employee.
 * @param {object} data 
 */
export const createEmployee = async (data) => {
  const response = await api.post('/employees', data);
  return response.data;
};

/**
 * Update an existing employee.
 * @param {string} id 
 * @param {object} data 
 */
export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

/**
 * Delete an employee by ID.
 * @param {string} id 
 */
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

/**
 * Fetch all employees without pagination (useful for selection dropdowns).
 * @param {object} extraParams 
 */
export const getAllEmployees = async (extraParams = {}) => {
  const response = await api.get('/employees', {
    params: {
      limit: 1000,
      page: 1,
      ...extraParams,
    },
  });
  return response.data;
};
