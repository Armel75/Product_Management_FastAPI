import axios from 'axios';

const apiURL = 'http://localhost:8000';

export const axiosClient = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred.';
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => `${err.loc.slice(1).join('/') || 'field'}: ${err.msg}`).join(' | ');
        }
      } else {
        if (status === 401) {
          errorMessage = 'Session expired or unauthorised. Please log in.';
        } else if (status === 403) {
          errorMessage = 'Forbidden action.';
        } else if (status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (status === 422) {
          errorMessage = 'Input validation check failed.';
        } else if (status >= 500) {
          errorMessage = 'Internal server error.';
        }
      }
    } else {
      errorMessage = 'Network connection issue. Falling back to simulated local database session.';
    }
    
    const normalizedError = new Error(errorMessage) as any;
    normalizedError.status = error.response ? error.response.status : null;
    normalizedError.originalError = error;
    
    return Promise.reject(normalizedError);
  }
);

export default axiosClient;
