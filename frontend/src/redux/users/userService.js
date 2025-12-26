import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/users';


export const fetchAllUsers = async () => {
  const token = Cookies.get('token');
  const response = await fetch(API_BASE_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (userData) => {
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("🔐 No token found");
  }
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const changePassword = async (userData) => {
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("🔐 No token found");
  }
  const response = await fetch(`${API_BASE_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to change password');
  return response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',

  });
  if (!response.ok) throw new Error('Failed to delete user');
  return id;
};