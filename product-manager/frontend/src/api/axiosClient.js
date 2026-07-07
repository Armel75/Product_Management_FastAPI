import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error handling for 401, 422, 500, etc.
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred.';
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle common FastAPI error structures
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Validation errors from Pydantic
          errorMessage = data.detail.map((err) => `${err.loc.slice(1).join('/') || 'field'}: ${err.msg}`).join(' | ');
        }
      } else {
        if (status === 401) {
          errorMessage = 'Session expired or unauthorised. Please log in.';
        } else if (status === 403) {
          errorMessage = 'Forbidden. You do not have permissions for this action.';
        } else if (status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (status === 422) {
          errorMessage = 'Validation error. Please verify input formats.';
        } else if (status >= 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
      }
    } else if (error.request) {
      errorMessage = 'Cannot establish connection to backend. Make sure the FastAPI server is running.';
    } else {
      errorMessage = error.message;
    }
    
    // Create a normalized structure for pages to consume
    const normalizedError = new Error(errorMessage);
    normalizedError.status = error.response ? error.response.status : null;
    normalizedError.originalError = error;
    
    return Promise.reject(normalizedError);
  }
);

export default axiosClient;
