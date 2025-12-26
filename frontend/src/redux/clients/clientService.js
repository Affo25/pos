const API_BASE_URL = 'http://localhost:5000/api/clients';

export const fetchAllClients = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
};

export const createClient = async (clientData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  if (!response.ok) throw new Error('Failed to create client');
  return response.json();
};

export const updateClient = async (id, clientData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  if (!response.ok) throw new Error('Failed to update client');
  return response.json();
};

export const deleteClient = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete client');
  return id;
};