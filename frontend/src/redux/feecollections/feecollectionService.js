import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/feecollections';
const getToken = () => Cookies.get('token');

export const fetchAllFeeCollections = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch feecollections');
  return data;
};

export const createFeeCollection = async (feecollectionData) => {
  try {
    const token = getToken();
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feecollectionData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.error || 'Failed to create feecollection');
    }
    return response.json();
  } catch (error) {
    console.error('Full error:', error);
    throw error;
  }
};

export const updateFeeCollection = async (id, feecollectionData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(feecollectionData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update feecollection');
  return data;
};

export const deleteFeeCollection = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete feecollection');
  }

  return id;
};
