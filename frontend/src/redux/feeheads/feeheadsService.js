import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/feeHeads';
const getToken = () => Cookies.get('token');



export const fetchAllFeeHeads = async (branchId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}?branch_id=${branchId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  console.log('📥 Response Data:', data);
  if (!response.ok) throw new Error(data.error || 'Failed to fetch feeheads');

  return data;
};

export const createFeeHeads = async (feeheadsData) => {
    const token = getToken();

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(feeheadsData),
  });
  if (!response.ok) throw new Error('Failed to create feeheads');
  return response.json();
};

export const updateFeeHeads = async (id, feeheadsData) => {
    const token = getToken();

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

    },
    body: JSON.stringify(feeheadsData),
  });
  if (!response.ok) throw new Error('Failed to update feeheads');
  return response.json();
};

export const deleteFeeHeads = async (id) => {
    const token = getToken();

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
     headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete feeheads');
  return id;
};