import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/staffs';
const getToken = () => Cookies.get('token');

export const fetchAllStaffs = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch staffs');
  return data;
};

export const createStaff = async (staffData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create staff');
  return data;
};

export const updateStaff = async (id, staffData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update staff');
  return data;
};

export const deleteStaff = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete staff');
  }

  return id;
};