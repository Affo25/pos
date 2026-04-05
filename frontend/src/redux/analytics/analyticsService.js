// analyticsService.js
import Cookies from 'js-cookie';

import { API_BASE as API_BASE_URL } from '../../config/apiBase';
const getToken = () => Cookies.get('token');

// Helper function for logging API calls
const logApiCall = (method, url, data = null) => {
  console.group(`📡 Analytics API Call: ${method} ${url}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔑 Token Present: ${!!getToken()}`);
  if (data) {
    console.log(`📦 Request Data:`, data);
  }
  console.groupEnd();
};

const logError = (method, url, error, response = null) => {
  console.group(`❌ Analytics API Error: ${method} ${url}`);
  console.error(`🔴 Error Message: ${error.message || error}`);
  console.error(`🔴 Error Stack:`, error.stack);
  if (response) {
    console.error(`📡 Response Status: ${response.status}`);
    console.error(`📡 Response Status Text: ${response.statusText}`);
    console.error(`📡 Response Data:`, response.data);
  }
  console.groupEnd();
};

const logSuccess = (method, url, data) => {
  console.group(`✅ Analytics API Success: ${method} ${url}`);
  console.log(`📦 Response Data:`, data);
  console.groupEnd();
};

// Helper function for making authenticated requests
const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token) {
    console.error('❌ No authentication token found');
    throw new Error('No authentication token found. Please login again.');
  }
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  console.log(`🔍 Making request to: ${url}`);
  console.log(`🔑 Token: ${token.substring(0, 20)}...`);
  
  const response = await fetch(url, mergedOptions);
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }
  
  if (!response.ok) {
    console.error(`❌ HTTP Error ${response.status}:`, data);
    throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
  }
  
  return data;
};

// ============= MAIN DASHBOARD API =============

/**
 * Get complete dashboard data for the pharmacy dashboard
 * @param {Object} params - Query parameters
 * @param {string} params.period - 'today', 'week', 'month', 'year' (default: 'month')
 * @param {string} params.startDate - Custom start date (YYYY-MM-DD)
 * @param {string} params.endDate - Custom end date (YYYY-MM-DD)
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboardData = async (params = {}) => {
  // CORRECTED: Using /analytics/dashboard instead of /dashboard
  const url = new URL(`${API_BASE_URL}/analytics/dashboard`);
  
  if (params.period) url.searchParams.append('period', params.period);
  if (params.startDate) url.searchParams.append('startDate', params.startDate);
  if (params.endDate) url.searchParams.append('endDate', params.endDate);
  
  logApiCall('GET', url.toString());
  
  try {
    const data = await authenticatedFetch(url.toString());
    logSuccess('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

/**
 * Get sales overview data for charts
 * @param {Object} params - Query parameters
 * @param {string} params.period - 'today', 'week', 'month', 'year'
 * @param {string} params.startDate - Custom start date
 * @param {string} params.endDate - Custom end date
 * @returns {Promise<Object>} Sales overview data
 */
export const getSalesOverview = async (params = {}) => {
  // CORRECTED: Using /analytics/sales-overview (matches your route)
  const url = new URL(`${API_BASE_URL}/analytics/sales-overview`);
  
  if (params.period) url.searchParams.append('period', params.period || 'week');
  if (params.startDate) url.searchParams.append('startDate', params.startDate);
  if (params.endDate) url.searchParams.append('endDate', params.endDate);
  
  logApiCall('GET', url.toString());
  
  try {
    const data = await authenticatedFetch(url.toString());
    logSuccess('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

/**
 * Get top selling products
 * @param {number} limit - Number of products to return (default: 10)
 * @returns {Promise<Object>} Top products data
 */
export const getTopProducts = async (params = 10) => {
  const limit = typeof params === 'number' ? params : params.limit ?? 10;
  const url = new URL(`${API_BASE_URL}/analytics/top-products`);
  url.searchParams.append('limit', String(limit));
  if (typeof params === 'object' && params != null) {
    if (params.startDate) url.searchParams.append('startDate', params.startDate);
    if (params.endDate) url.searchParams.append('endDate', params.endDate);
  }
  logApiCall('GET', url.toString());
  try {
    const data = await authenticatedFetch(url.toString());
    logSuccess('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

/**
 * Get recent activities (sales, products, customers)
 * @param {number} limit - Number of activities to return (default: 10)
 * @returns {Promise<Object>} Recent activities data
 */
export const getRecentActivities = async (limit = 10) => {
  // CORRECTED: Using /analytics/recent-activities (matches your route)
  const url = `${API_BASE_URL}/analytics/recent-activities?limit=${limit}`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

// ============= ANALYTICS API =============

/**
 * Get complete analytics dashboard data
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalyticsDashboard = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/analytics/dashboard`);
  
  if (params.period) url.searchParams.append('period', params.period);
  if (params.startDate) url.searchParams.append('startDate', params.startDate);
  if (params.endDate) url.searchParams.append('endDate', params.endDate);
  
  logApiCall('GET', url.toString());
  
  try {
    const data = await authenticatedFetch(url.toString());
    logSuccess('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

/**
 * Get sales chart data for visualizations
 * @param {Object} params - Query parameters
 * @param {string} params.period - 'today', 'week', 'month', 'year'
 * @param {number} params.year - Year for filtering
 * @param {number} params.month - Month for filtering (1-12)
 * @returns {Promise<Object>} Sales chart data
 */
export const getSalesChartData = async (params = {}) => {
  return getSalesOverview({
    period: params.period || 'month',
    startDate: params.startDate,
    endDate: params.endDate,
  });
};

/**
 * Get product performance analytics
 * @param {Object} params - Query parameters
 * @param {string} params.sortBy - 'quantity', 'revenue' (default: 'revenue')
 * @param {number} params.limit - Number of products to return (default: 20)
 * @returns {Promise<Object>} Product analytics data
 */
export const getProductAnalytics = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/analytics/products`);
  
  if (params.sortBy) url.searchParams.append('sortBy', params.sortBy);
  if (params.limit) url.searchParams.append('limit', params.limit || 20);
  
  logApiCall('GET', url.toString());
  
  try {
    const data = await authenticatedFetch(url.toString());
    logSuccess('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

/**
 * Get stock analytics and alerts
 * @returns {Promise<Object>} Stock analytics data
 */
export const getStockAnalytics = async () => {
  const url = `${API_BASE_URL}/analytics/stock`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Get low stock products alert
 * @param {number} limit - Number of products to return (default: 20)
 * @returns {Promise<Object>} Low stock products
 */
export const getLowStockProducts = async (limit = 20) => {
  const url = `${API_BASE_URL}/analytics/stock/low-stock?limit=${limit}`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Get customer analytics and insights
 * @returns {Promise<Object>} Customer analytics data
 */
export const getCustomerAnalytics = async () => {
  const url = `${API_BASE_URL}/analytics/customers`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

/**
 * Get top customers by spending
 * @param {number} limit - Number of customers to return (default: 10)
 * @returns {Promise<Object>} Top customers data
 */
export const getTopCustomers = async (limit = 10) => {
  const url = `${API_BASE_URL}/analytics/customers/top?limit=${limit}`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

// ============= REAL-TIME STATS API =============

/**
 * Get real-time dashboard statistics
 * @returns {Promise<Object>} Real-time stats
 */
export const getRealtimeStats = async () => {
  const url = `${API_BASE_URL}/analytics/realtime`;
  logApiCall('GET', url);
  
  try {
    const data = await authenticatedFetch(url);
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

// ============= EXPORT/REPORT API =============

/**
 * Export analytics report
 * @param {Object} params - Report parameters
 * @param {string} params.type - 'sales', 'products', 'customers', 'stock'
 * @param {string} params.format - 'pdf', 'excel', 'csv'
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @returns {Promise<Blob>} Report file
 */
export const exportAnalyticsReport = async (params = {}) => {
  const url = new URL(`${API_BASE_URL}/analytics/export`);
  
  if (params.type) url.searchParams.append('type', params.type);
  if (params.format) url.searchParams.append('format', params.format || 'pdf');
  if (params.startDate) url.searchParams.append('startDate', params.startDate);
  if (params.endDate) url.searchParams.append('endDate', params.endDate);
  
  logApiCall('GET', url.toString());
  
  try {
    const token = getToken();
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }
    
    const blob = await response.blob();
    logSuccess('GET', url.toString(), { blobSize: blob.size, type: blob.type });
    return blob;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
};

// ============= UTILITY FUNCTIONS =============

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount !== 0 && !amount) return 'PKR\u00A00.00';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

/**
 * Format number with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get greeting based on time of day
 * @returns {string} Greeting message
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Test analytics API connection
 * @returns {Promise<boolean>} Connection status
 */
export const testAnalyticsConnection = async () => {
  console.group('🔧 Testing Analytics API Connection');
  console.log(`🌐 API Base URL: ${API_BASE_URL}/analytics/dashboard`);
  console.log(`🔑 Token exists: ${!!getToken()}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    console.log(`📡 Connection test status: ${response.status} ${response.statusText}`);
    console.groupEnd();
    return response.ok;
  } catch (error) {
    console.error(`❌ Connection test failed:`, error);
    console.groupEnd();
    return false;
  }
};

// ============= COMPLETE API OBJECT FOR EASY IMPORT =============

const analyticsAPI = {
  // Dashboard APIs
  getDashboardData,
  getSalesOverview,
  getTopProducts,
  getRecentActivities,
  
  // Analytics APIs
  getAnalyticsDashboard,
  getSalesChartData,
  getProductAnalytics,
  getStockAnalytics,
  getLowStockProducts,
  getCustomerAnalytics,
  getTopCustomers,
  
  // Real-time API
  getRealtimeStats,
  
  // Export API
  exportAnalyticsReport,
  
  // Utilities
  formatCurrency,
  formatNumber,
  calculatePercentageChange,
  getGreeting,
  testAnalyticsConnection,
};

export default analyticsAPI;