import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/suppliers`;
const getToken = () => Cookies.get('token');

export const fetchAllSuppliers = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch suppliers');
  return data;
};

export const createSupplier = async (supplierData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(supplierData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create supplier');
  return data;
};

export const updateSupplier = async ({id, data}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const datas = await response.json();
  if (!response.ok) throw new Error(datas.error || 'Failed to update supplier');
  return datas;
};

export const deleteSupplier = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete supplier');
  }

  return id;
};