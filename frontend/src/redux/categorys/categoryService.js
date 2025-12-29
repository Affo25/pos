import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/categorys';
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

export const updateCategory = async (id, categoryData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update category');
  return data;
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