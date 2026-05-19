import Cookies from 'js-cookie';
import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/payments`;
const getToken = () => Cookies.get('token');

export const fetchAllPayments = async (params = {}) => {
  const token = getToken();
  const query = new URLSearchParams();
  if (params.payment_type) query.set('payment_type', params.payment_type);
  if (params.status) query.set('status', params.status);
  if (params.reference_id) query.set('reference_id', params.reference_id);
  const qs = query.toString();
  const url = qs ? `${API_BASE_URL}?${qs}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch payments');
  return data;
};

export const createPayment = async (paymentData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create payment');
  return data;
};

export const cancelPayment = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to cancel payment');
  return data;
};
