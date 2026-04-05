import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/faculties`;
const getToken = () => Cookies.get('token');

export const fetchAllFaculties = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log('📥 Response Data:', data);
  if (!response.ok) throw new Error(data.error || 'Failed to fetch faculties');

  return data;
};

export const createFaculties = async (facultiesData) => {
  try {
    const token = getToken();
    console.log('📤 Sending Data:', facultiesData);  // ✅ Add this
    console.log('🔑 Token:', token);  // ✅ Add this

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(facultiesData),
    });

    console.log('📥 Response Status:', response.status); 

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error details:', errorData);  
      throw new Error(errorData.error || 'Failed to create faculties');
    }

    const result = await response.json();
    console.log('✅ Success Response:', result);  
    return result;
  } catch (error) {
    console.error('❌ Full error:', error);
    throw error;
  }
};
export const updateFaculties = async (id, facultiesData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(facultiesData),
  });
  if (!response.ok) throw new Error('Failed to update faculties');
  return response.json();
};

export const deleteFaculties = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete faculties');
  return id;
};