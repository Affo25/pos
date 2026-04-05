// redux/auth/authService.js
import axios from 'axios';

import { API_BASE } from '../../config/apiBase';

const API_URL = `${API_BASE}/users`;

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};
