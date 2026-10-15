import api from './axios';

/**
 * Fetch dashboard aggregated metrics and employee workload.
 */
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};
