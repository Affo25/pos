import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/events';
const getToken = () => Cookies.get('token');

export const fetchAllEvents = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch events');
  return data;
};

export const createEvent = async (eventData) => {
  const token = getToken();

  const formData = new FormData();

  Object.keys(eventData).forEach((key) => {
    if (key === 'eventImage' && eventData[key]) {
      formData.append('eventImage', eventData[key]);
      console.log('Appending file:', eventData[key].name);
    } else {
      formData.append(key, eventData[key]);
      console.log('Appending field:', key, eventData[key]);
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
  if (!response.ok) throw new Error(data.error || 'Failed to create event');
  return data;
};

export const updateEvent = async (id, eventData) => {
  const token = getToken();

  const formData = new FormData();

  Object.keys(eventData).forEach((key) => {
    if (key === 'eventImage' && eventData[key]) {
      formData.append('eventImage', eventData[key]);
    } else {
      formData.append(key, eventData[key]);
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
  if (!response.ok) throw new Error(data.error || 'Failed to update event');
  return data;
};

export const deleteEvent = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete event');
  }

  return id;
};
