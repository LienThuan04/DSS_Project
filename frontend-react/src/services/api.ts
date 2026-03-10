import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for file uploads (no default Content-Type)
const fileUploadClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Customers API
export const customersApi = {
  list: (page: number = 1, limit: number = 20, search?: string) =>
    apiClient.get('/customers', { params: { page, limit, search } }),
  get: (id: string) => apiClient.get(`/customers/${id}`),
  getByCustomerId: (customerId: string) =>
    apiClient.get(`/customers/by-id/${customerId}`),
  create: (data: any) => apiClient.post('/customers', data),
  update: (id: string, data: any) => apiClient.put(`/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
  stats: () => apiClient.get('/customers/stats'),
  segmentedStats: () => apiClient.get('/customers/stats/segments'),
  import: (customers: any[]) => apiClient.post('/customers/import', customers),
  importCsv: (formData: FormData) => fileUploadClient.post('/customers/import', formData),
};

// Predictions API
export const predictionsApi = {
  list: (page: number = 1, limit: number = 20, riskLevel?: string) =>
    apiClient.get('/predictions', { params: { page, limit, riskLevel } }),
  get: (id: string) => apiClient.get(`/predictions/${id}`),
  create: (customerId: string, data: any) =>
    apiClient.post('/predictions', data, { params: { customerId } }),
  predictByCustomerId: (customerId: string) =>
    apiClient.post(`/predictions/customer/${customerId}`),
  predictRaw: (data: any) =>
    apiClient.post('/predictions', data),
  whatIf: (request: any) =>
    apiClient.post('/predictions/what-if', request),
  highRisk: (limit: number = 100) =>
    apiClient.get('/predictions/high-risk', { params: { limit } }),
  mediumRisk: (limit: number = 100) =>
    apiClient.get('/predictions/medium-risk', { params: { limit } }),
  stats: () => apiClient.get('/predictions/stats'),
  delete: (id: string) => apiClient.delete(`/predictions/${id}`),
  health: () => apiClient.get('/predictions/health'),
  getCustomers: (limit: number = 200) =>
    apiClient.get('/customers', { params: { page: 1, limit } }),
};

// Health Check
export const healthApi = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
