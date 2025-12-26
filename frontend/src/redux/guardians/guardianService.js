import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api/guardians';
const getToken = () => Cookies.get('token');

export const fetchAllGuardians = async (branchId) => {
  const token = getToken();
  const url = branchId ? `${API_BASE_URL}?branch_id=${branchId}` : API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch guardians');
  return data;
};

export const createGuardian = async (guardianData) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(guardianData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create guardian');
  return data;
};

export const updateGuardian = async (id, guardianData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(guardianData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update guardian');
  return data;
};

export const deleteGuardian = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete guardian');
  }

  return id;
};







// /* eslint-disable class-methods-use-this */
// import http from "../httpsService/httpService";

// const API_BASE_URL = '/guardians';

// class GuardianService {
//   async getGuardians(branchId) {
//     const params = branchId ? { branch_id: branchId } : {};
//     const result = await http.get(API_BASE_URL, { params });
//     return result.data;
//   }

//   async createGuardian(data) {
//     const result = await http.post(API_BASE_URL, data);
//     return result.data;
//   }

//   async updateGuardian({ id, data }) {
//     const result = await http.put(`${API_BASE_URL}/${id}`, data);
//     return result.data;
//   }

//   async deleteGuardian(id) {
//     const result = await http.delete(`${API_BASE_URL}/${id}`);
//     return result.data;
//   }
// }

// export default new GuardianService();
