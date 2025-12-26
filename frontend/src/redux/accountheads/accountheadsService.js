import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/accountheads';
const getToken = () => Cookies.get('token');


export const fetchAllAccountHeads = async (branchId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}?branch_id=${branchId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log('📥 Response Data:', data);
  if (!response.ok) throw new Error(data.error || 'Failed to fetch accountheads');

  return data;
};

export const createAccountHeads = async (accountheadsData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(accountheadsData),
  });
  if (!response.ok) throw new Error('Failed to create accountheads');
  return response.json();
};

export const updateAccountHeads = async (id, accountheadsData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(accountheadsData),
  });
  if (!response.ok) throw new Error('Failed to update accountheads');
  return response.json();
};

export const deleteAccountHeads = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to delete accountheads');
  return id;
};