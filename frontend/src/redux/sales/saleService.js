import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/sales`;
const getToken = () => Cookies.get('token');

export const fetchAllSales = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch sales');
  return data;
};

export const createSale = async (saleData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(saleData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create sale');
  return data;
};

export const updateSale = async (id, saleData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(saleData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update sale');
  return data;
};

export const processReturn = async (returnData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/returns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(returnData),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg =
      Array.isArray(data.errors) && data.errors.length
        ? data.errors.join('; ')
        : data.error || data.message || 'Failed to process return';
    throw new Error(errMsg);
  }
  return data;
};

export const deleteSale = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete sale');
  }

  return id;
};