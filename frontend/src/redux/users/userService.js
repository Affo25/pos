import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/users`;

// Helper function for logging API calls
const logApiCall = (method, url, data = null) => {
  console.group(`📡 API Call: ${method} ${url}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🔑 Token Present: ${!!Cookies.get('token')}`);
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
  }
  console.groupEnd();
};

const logSuccess = (method, url, data) => {
  console.group(`✅ API Success: ${method} ${url}`);
  console.log(`📦 Response Data:`, data);
  console.groupEnd();
};

export const fetchAllUsers = async () => {
  const token = Cookies.get('token');
  const url = API_BASE_URL;
  
  logApiCall('GET', url);
  
  try {
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Failed to fetch users (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
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

export const createUser = async (userData) => {
  const token = Cookies.get('token');
  const url = API_BASE_URL;
  
  logApiCall('POST', url, userData);
  
  try {
    if (!token) {
      console.error('🔐 No authentication token found');
      throw new Error("🔐 No token found. Please login again.");
    }
    
    console.log(`🔍 Token being used: ${token.substring(0, 20)}...`);
    console.log(`📦 User Data being sent:`, JSON.stringify(userData, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'user_type'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields:`, missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = 'Failed to create user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
        
        // Handle specific error cases
        if (response.status === 409) {
          errorMessage = 'User with this email already exists';
        } else if (response.status === 400) {
          errorMessage = errorData.error || 'Invalid user data provided';
        }
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    logSuccess('POST', url, data);
    return data;
  } catch (error) {
    logError('POST', url, error);
    throw error;
  }
};

export const changePassword = async (userData) => {
  const token = Cookies.get('token');
  const url = `${API_BASE_URL}/change-password`;
  
  logApiCall('POST', url, { ...userData, password: '***HIDDEN***' });
  
  try {
    if (!token) {
      console.error('🔐 No authentication token found');
      throw new Error("🔐 No token found. Please login again.");
    }
    
    console.log(`🔍 Token being used: ${token.substring(0, 20)}...`);
    
    // Validate required fields
    if (!userData.currentPassword || !userData.newPassword) {
      console.error('❌ Missing password fields');
      throw new Error('Both current password and new password are required');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = 'Failed to change password';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Current password is incorrect';
        } else if (response.status === 400) {
          errorMessage = errorData.error || 'Invalid password data';
        }
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    logSuccess('POST', url, data);
    return data;
  } catch (error) {
    logError('POST', url, error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  const token = Cookies.get('token');
  const url = `${API_BASE_URL}/${id}`;
  
  logApiCall('PUT', url, userData);
  
  try {
    if (!id) {
      console.error('❌ Invalid user ID');
      throw new Error('User ID is required for update');
    }
    
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    console.log(`🆔 User ID: ${id}`);
    console.log(`📦 Update Data:`, JSON.stringify(userData, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
        
        // Handle specific error cases
        if (response.status === 404) {
          errorMessage = 'User not found';
        } else if (response.status === 409) {
          errorMessage = 'Email already in use by another user';
        }
      } catch (jsonError) {
        console.error(`❌ Could not parse error response:`, jsonError);
        const textResponse = await response.text();
        console.error(`📡 Raw Response:`, textResponse);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    logSuccess('PUT', url, data);
    return data;
  } catch (error) {
    logError('PUT', url, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  const token = Cookies.get('token');
  const url = `${API_BASE_URL}/${id}`;
  
  logApiCall('DELETE', url);
  
  try {
    if (!id) {
      console.error('❌ Invalid user ID');
      throw new Error('User ID is required for deletion');
    }
    
    console.log(`🔍 Token being used: ${token ? `${token.substring(0, 20)}...` : 'No token found'}`);
    console.log(`🆔 User ID to delete: ${id}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`❌ Server Error Response:`, errorData);
        
        if (response.status === 404) {
          errorMessage = 'User not found';
        }
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
      data = { message: 'User deleted successfully', id };
    }
    
    return id;
  } catch (error) {
    logError('DELETE', url, error);
    throw error;
  }
};

// Additional debugging utility
export const testUsersApiConnection = async () => {
  console.group('🔧 Testing Users API Connection');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🔑 Token exists: ${!!Cookies.get('token')}`);
  
  try {
    const token = Cookies.get('token');
    const response = await fetch(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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