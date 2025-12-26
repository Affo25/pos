import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/taskmanagements';
const getToken = () => Cookies.get('token');

export const fetchAllTaskManagements = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch taskmanagements');
  return data;
};

export const createTaskManagement = async (taskmanagementData) => {
  const token = getToken();

  const formData = new FormData();
  Object.keys(taskmanagementData).forEach(key => {
    if (key === 'taskImage' && taskmanagementData[key]) {
      formData.append('taskImage', taskmanagementData[key]);
      console.log('Appending file:', taskmanagementData[key].name);
    } else {
      formData.append(key, taskmanagementData[key]);
      console.log('Appending field:', key, taskmanagementData[key]);
    }
  });

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create taskmanagement');
  return data;
};

export const updateTaskManagement = async (id, taskmanagementData) => {
  const token = getToken();

  const formData = new FormData();

  Object.keys(taskmanagementData).forEach(key => {
    if (key === 'taskImage' && taskmanagementData[key]) {
      formData.append('taskImage', taskmanagementData[key]);
    } else {
      formData.append(key, taskmanagementData[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update taskmanagement');
  return data;
};

export const deleteTaskManagement = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete taskmanagement');
  }

  return id;
};