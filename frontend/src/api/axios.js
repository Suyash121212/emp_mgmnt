import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor to extract helpful error messages and handle server errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.error) {
        message = error.response.data.error;
      }
    } else if (error.request) {
      message = 'Unable to connect to server. Please check if the backend is running.';
    } else if (error.message) {
      message = error.message;
    }

    error.extractedMessage = message;
    error.validationErrors = error.response?.data?.errors || [];

    return Promise.reject(error);
  }
);

export default api;
