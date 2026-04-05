import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/categorys`;
const getToken = () => Cookies.get('token');

export const fetchAllCategorys = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch categorys');
  return data;
};

export const createCategory = async (categoryData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create category');
  return data;
};

export const updateCategory = async ({id, data}) => {
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
  if (!response.ok) throw new Error(datas.error || 'Failed to update category');
  return datas;
};

export const deleteCategory = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete category');
  }

  return id;
};