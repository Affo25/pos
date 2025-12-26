import Cookies from 'js-cookie';


const API_BASE_URL = 'http://localhost:5000/api/subjects';
const getToken = () => Cookies.get('token');


export const fetchAllSubjects = async (branchId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}?branch_id=${branchId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log('📥 Response Data:', data);
  if (!response.ok) throw new Error(data.error || 'Failed to fetch subjects');

  return data;
};

export const createSubjects = async (subjectsData) => {
  const token = getToken();
  console.log('📦 Sending token:', token);
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subjectsData),
  });
  if (!response.ok) throw new Error('Failed to create subjects');
  return response.json();
};

export const updateSubjects = async (id, subjectsData) => {
  const token = getToken();
  console.log('📦 Sending token:', token);
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subjectsData),
  });
  if (!response.ok) throw new Error('Failed to update subjects');
  return response.json();
};

export const deleteSubjects = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {

    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete subjects');
  return id;
};