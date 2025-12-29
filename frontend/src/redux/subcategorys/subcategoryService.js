import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/subcategorys';
const getToken = () => Cookies.get('token');

export const fetchAllSubCategorys = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch subcategorys');
  return data;
};

export const createSubCategory = async (subcategoryData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subcategoryData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create subcategory');
  return data;
};

export const updateSubCategory = async (id, subcategoryData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subcategoryData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update subcategory');
  return data;
};

export const deleteSubCategory = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete subcategory');
  }

  return id;
};