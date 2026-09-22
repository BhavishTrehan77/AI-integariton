import axios from 'axios';

// Dedicated Axios instance for Auth API
export const authClient = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token if present
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for detailed, user-friendly error extraction
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Authentication request failed';

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        message = 'Connection timed out. Please check your network and try again.';
      } else {
        message = 'Unable to connect to the authentication server. Please ensure the backend server is running on port 3000.';
      }
    } else if (error.response.status === 401) {
      message = error.response.data?.message || 'Invalid email or password. Please verify and try again.';
    } else if (error.response.status === 400) {
      message = error.response.data?.message || 'Invalid registration or login details.';
    } else if (error.response.status === 404) {
      message = 'Authentication service endpoint not found.';
    } else if (error.response.status >= 500) {
      message = error.response.data?.message || 'Internal server error occurred. Please try again later.';
    } else {
      message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message ||
        'Authentication request failed';
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * Register a new user
 * @param {{ name?: string, email: string, password: string }} credentials
 */
export async function signupUser({ name, email, password }) {
  const response = await authClient.post('/signup', {
    name: name?.trim(),
    email: email?.trim(),
    password,
  });
  return response.data;
}

/**
 * Login an existing user
 * @param {{ email: string, password: string }} credentials
 */
export async function loginUser({ email, password }) {
  const response = await authClient.post('/login', {
    email: email?.trim(),
    password,
  });
  return response.data;
}
