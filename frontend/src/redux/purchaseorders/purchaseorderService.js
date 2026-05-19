import Cookies from 'js-cookie';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/purchaseOrders`;
const getToken = () => Cookies.get('token');

export const fetchNextOrderNumber = async (orderDate) => {
  const token = getToken();
  const qs = orderDate ? `?order_date=${encodeURIComponent(orderDate)}` : '';
  const response = await fetch(`${API_BASE_URL}/next-order-number${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch order number');
  return data.order_number;
};

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

export const addPurchaseOrderReturn = async (id, returnData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}/returns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(returnData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to record return');
  return data;
};