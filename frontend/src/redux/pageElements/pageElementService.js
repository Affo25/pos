// redux/pageElement/pageElementService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/page-elements';

export const fetchAllPageElements = async (pageId) => {
  const res = await axios.get(`${API_BASE_URL}?page_id=${pageId}`);
  return res.data;
};

export const fetchById = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/${id}`);
  return res.data;
};

export const create = async (data) => {
  const res = await axios.post(API_BASE_URL, data);
  return res.data;
};

export const update = async (id, data) => {
  const res = await axios.put(`${API_BASE_URL}/${id}`, data);
  return res.data;
};

export const remove = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
};
