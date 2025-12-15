/**
 * @deprecated Use src/services/productService.js instead
 * This file is kept for backward compatibility but should not be used in new code
 */
import axios from "axios";
import apiConfig from "./config/api.config";

export const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 5000
});
