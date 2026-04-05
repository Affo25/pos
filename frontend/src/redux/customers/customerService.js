import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/customers`;
const getToken = () => Cookies.get('token');

export const fetchAllCustomers = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch customers');
  return data;
};

export const createCustomer = async (customerData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create customer');
  return data;
};

export const updateCustomer = async (id, customerData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update customer');
  return data;
};

export const deleteCustomer = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete customer');
  }

  return id;
};