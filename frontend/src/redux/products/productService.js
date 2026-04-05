import Cookies from 'js-cookie';
import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/products`;
const getToken = () => Cookies.get('token');

// Helper function for logging API calls
const logApiCall = (method, url, data = null) => {
  console.group(`📡 API Call: ${method} ${url}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔑 Token Present: ${!!getToken()}`);
  if (data) {
    console.log(`📦 Request Data:`, data);
  }
  console.groupEnd();
};

const logError = (method, url, error, response = null) => {
  console.group(`❌ API Error: ${method} ${url}`);
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
  console.group(`✅ API Success: ${method} ${url}`);
  console.log(`📦 Response Data:`, data);
  console.groupEnd();
};

export const fetchAllProducts = async () => {
  const token = getToken();
  const url = API_BASE_URL;
  
  logApiCall('GET', url);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ HTTP Error ${response.status}:`, data);
      throw new Error(data.error || `Failed to fetch products (Status: ${response.status})`);
    }
    
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

export const fetchAllCategories = async () => {
  const token = getToken();
  const url = `${API_BASE}/categorys`;
  
  logApiCall('GET', url);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = `Failed to fetch categories (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

export const fetchAllSuppliers = async () => {
  const token = getToken();
  const url = `${API_BASE}/suppliers`;
  
  logApiCall('GET', url);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch suppliers (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    logSuccess('GET', url, data);
    return data;
  } catch (error) {
    logError('GET', url, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  const token = getToken();
  const url = API_BASE_URL;
  
  logApiCall('POST', url, productData);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    console.log(`📦 Product Data being sent:`, JSON.stringify(productData, null, 2));
    
    // Validate required fields (0 is valid for available_quantity / unit_price — do not use !value)
    const requiredFields = ['name', 'category', 'batch_number', 'expiry_date', 'supplier_name', 'medicine_size', 'available_quantity', 'unit_price'];
    const isMissing = (v) => {
      if (v === undefined || v === null) return true;
      if (typeof v === 'number' && Number.isNaN(v)) return true;
      if (typeof v === 'string' && v.trim() === '') return true;
      return false;
    };
    const missingFields = requiredFields.filter((field) => isMissing(productData[field]));
    
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields:`, missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Server Error Response:`, data);
      throw new Error(data.error || `Failed to create product (Status: ${response.status})`);
    }
    
    logSuccess('POST', url, data);
    return data;
  } catch (error) {
    logError('POST', url, error);
    throw error;
  }
};

export const updateProduct = async ({ id, data }) => {
  const token = getToken();
  const url = `${API_BASE_URL}/${id}`;

  logApiCall('PUT', url, data);

  try {
    console.log(
      `🔍 Token being used: ${
        token ? `${token.substring(0, 20)}...` : 'No token found'
      }`
    );
    console.log(`🆔 Product ID: ${id}`);
    console.log(`📦 Update Data:`, JSON.stringify(data, null, 2));

    if (!id) {
      console.error(`❌ Invalid product ID: ${id}`);
      throw new Error('Product ID is required for update');
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log(
      `📡 Response Status: ${response.status} ${response.statusText}`
    );

    const responseData = await response.json(); // ✅ FIXED

    if (!response.ok) {
      console.error(`❌ Server Error Response:`, responseData);
      throw new Error(
        responseData.error ||
          `Failed to update product (Status: ${response.status})`
      );
    }

    logSuccess('PUT', url, responseData);
    return responseData;
  } catch (error) {
    logError('PUT', url, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  const token = getToken();
  const url = `${API_BASE_URL}/${id}`;
  
  logApiCall('DELETE', url);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    console.log(`🆔 Product ID to delete: ${id}`);
    
    if (!id) {
      console.error(`❌ Invalid product ID: ${id}`);
      throw new Error('Product ID is required for deletion');
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Failed to delete product (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }
    
    // Try to parse JSON response if exists, otherwise return id
    let data;
    try {
      data = await response.json();
      logSuccess('DELETE', url, data);
    } catch (e) {
      console.log(`ℹ️ No JSON response body for DELETE operation`);
      data = { message: 'Product deleted successfully', id };
    }
    
    return id;
  } catch (error) {
    logError('DELETE', url, error);
    throw error;
  }
};

// Additional debugging utility
export const testApiConnection = async () => {
  console.group('🔧 Testing API Connection');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🔑 Token exists: ${!!getToken()}`);
  
  try {
    const response = await fetch(API_BASE_URL, {
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