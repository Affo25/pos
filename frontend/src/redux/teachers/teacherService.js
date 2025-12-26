const API_BASE_URL = 'http://localhost:5000/api/teachers';

export const fetchAllTeachers = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch teachers');
  return response.json();
};

export const createTeacher = async (teacherData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacherData),
  });
  if (!response.ok) throw new Error('Failed to create teacher');
  return response.json();
};

export const updateTeacher = async (id, teacherData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacherData),
  });
  if (!response.ok) throw new Error('Failed to update teacher');
  return response.json();
};

export const deleteTeacher = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete teacher');
  return id;
};