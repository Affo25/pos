/* eslint-disable camelcase */
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/classAttendances';
const getToken = () => Cookies.get('token');

export const fetchAllClassAttendances = async ({ branch_id, classCode, date }) => {
  const token = getToken();
  let url = API_BASE_URL;
  const params = [];
  if (branch_id) params.push(`branch_id=${branch_id}`);
  if (classCode) params.push(`classCode=${classCode}`);
  if (date) params.push(`date=${date}`);
  if (params.length) url += `?${params.join('&')}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch classattendances');
  return data;
};


export const createClassAttendance = async (classattendanceData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(classattendanceData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create classattendance');
  return data;
};

export const updateClassAttendance = async (id, classattendanceData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(classattendanceData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update classattendance');
  return data;
};

export const getClassAttendanceSummary = async ({ classCode, month }) => {
  const token = getToken();

  const url = `${API_BASE_URL}/summary?classCode=${classCode}&month=${month}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance summary');
  return data;
};


export const deleteClassAttendance = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete classattendance');
  }

  return id;
};