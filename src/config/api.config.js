/**
 * Centralized API Configuration
 * All API endpoints and base URLs are managed here
 */

// Use environment variables with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    byCategory: '/products',
  },
  categories: {
    list: '/categories',
  },
};

// Create full URL helper
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default {
  baseURL: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  getApiUrl,
};

