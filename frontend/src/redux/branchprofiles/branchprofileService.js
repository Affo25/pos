import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/branchprofiles';
const token = Cookies.get('token');

export const fetchAllBranchProfiles = async () => {
  const response = await fetch(API_BASE_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch branchprofiles');
  return response.json();
};

export const createBranchProfile = async (branchprofileData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(branchprofileData),
  });
  if (!response.ok) throw new Error('Failed to create branchprofile');
  return response.json();
};

export const updateBranchProfile = async (id, branchprofileData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(branchprofileData),
  });
  if (!response.ok) throw new Error('Failed to update branchprofile');
  return response.json();
};

export const deleteBranchProfile = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete branchprofile');
  return id;
};