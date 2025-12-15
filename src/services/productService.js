/**
 * Product Service Layer
 * All product-related API calls are centralized here
 */

import { getApiUrl, API_ENDPOINTS } from '../config/api.config';

/**
 * Fetch all products
 * @param {Object} filters - Optional filters (category, search)
 * @returns {Promise<Array>} Array of products
 */
export const getAllProducts = async (filters = {}) => {
  try {
    const url = getApiUrl(API_ENDPOINTS.products.list);
    const queryParams = new URLSearchParams(filters).toString();
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 * @param {string|number} id - Product ID
 * @returns {Promise<Object>} Product details
 */
export const getProductById = async (id) => {
  try {
    const url = getApiUrl(API_ENDPOINTS.products.detail(id));
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async () => {
  try {
    const url = getApiUrl(API_ENDPOINTS.categories.list);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default {
  getAllProducts,
  getProductById,
  getCategories,
};

