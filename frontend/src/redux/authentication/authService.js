// redux/auth/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};
