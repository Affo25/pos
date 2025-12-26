const API_BASE_URL = 'http://localhost:5000/api/kirlas';

export const fetchAllKirlas = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch kirlas');
  return response.json();
};

export const createKirla = async (kirlaData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(kirlaData),
  });
  if (!response.ok) throw new Error('Failed to create kirla');
  return response.json();
};

export const updateKirla = async (id, kirlaData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(kirlaData),
  });
  if (!response.ok) throw new Error('Failed to update kirla');
  return response.json();
};

export const deleteKirla = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete kirla');
  return id;
};