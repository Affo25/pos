import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/classLists';
const getToken = () => Cookies.get('token');

export const fetchAllClassLists = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch classLists');
  return data;
};

export const createClassList = async (classListData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(classListData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create classList');
  return data;
};

export const updateClassList = async (id, classListData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(classListData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update classList');
  return data;
};

export const deleteClassList = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete classList');
  }

  return id;
};
