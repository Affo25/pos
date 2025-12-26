import Cookies from 'js-cookie';


const API_BASE_URL = 'http://localhost:5000/api/departments';
const getToken = () => Cookies.get('token');


export const fetchAllDepartments = async (branchId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}?branch_id=${branchId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log('📥 Response Data:', data);
  if (!response.ok) throw new Error(data.error || 'Failed to fetch departments');

  return data;
};

export const createDepartment = async (departmentData) => {
   const token = getToken();
    console.log('📦 Sending token:', token)
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(departmentData),
  });
  if (!response.ok) throw new Error('Failed to create department');
  return response.json();
};

export const updateDepartment = async (id, departmentData) => {
   const token = getToken();
    console.log('📦 Sending token:', token)
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(departmentData),
  });
  if (!response.ok) throw new Error('Failed to update department');
  return response.json();
};

export const deleteDepartment = async (id) => {
   const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to delete department');
  return id;
};