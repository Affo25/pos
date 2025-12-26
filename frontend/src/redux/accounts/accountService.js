import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/accounts';
const getToken = () => Cookies.get('token');

export const fetchAllAccounts = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch accounts');
  return data;
};

export const createAccount = async (accountData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(accountData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create account');
  return data;
};

export const updateAccount = async (id, accountData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(accountData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update account');
  return data;
};

export const deleteAccount = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete account');
  }

  return id;
};