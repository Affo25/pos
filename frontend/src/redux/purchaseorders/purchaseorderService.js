import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/purchaseorders';
const getToken = () => Cookies.get('token');

export const fetchAllPurchaseOrders = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch purchaseorders');
  return data;
};

export const createPurchaseOrder = async (purchaseorderData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(purchaseorderData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create purchaseorder');
  return data;
};

export const updatePurchaseOrder = async (id, purchaseorderData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(purchaseorderData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update purchaseorder');
  return data;
};

export const deletePurchaseOrder = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete purchaseorder');
  }

  return id;
};