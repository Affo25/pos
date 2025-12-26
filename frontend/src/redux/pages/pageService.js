// services/pageService.js
// import Cookies from 'js-cookie';

// const API_BASE_URL = 'http://localhost:5000/api/entities';
// const token = Cookies.get('token');

// export const fetchAllPages = async () => {
//   const response = await fetch(API_BASE_URL, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
//   if (!response.ok) {
//     throw new Error('Failed to fetch pages');
//   }
//   const data = await response.json();
//   return data;
// };

// export const fetchSinglePage = async (id) => {
//   const response = await fetch(`${API_BASE_URL}/${id}`);
//   if (!response.ok) throw new Error('Page not found');
//   return response.json();
// };

// export const createPage = async (pageData) => {
//   const response = await fetch(API_BASE_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify(pageData),
//   });
//   if (!response.ok) throw new Error('Failed to create page');
//   return response.json();
// };

// export const updatePage = async (id, pageData) => {
//   const response = await fetch(`${API_BASE_URL}/${id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify(pageData),
//   });
//   if (!response.ok) throw new Error('Failed to update page');
//   return response.json(); // Removed await
// };

// export const deletePage = async (id) => {
//   const response = await fetch(`${API_BASE_URL}/${id}`, {
//     method: 'DELETE',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
//   if (!response.ok) throw new Error('Failed to delete page');
//   return id;
// };

// export const filterPagesByStatus = async (status) => {
//   const url = status === 'all' ? API_BASE_URL : `${API_BASE_URL}?status=${status}`;

//   const response = await fetch(url, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
//   if (!response.ok) throw new Error('Failed to filter pages');
//   return response.json();
// };


const API_BASE_URL = 'http://localhost:5000/api/entities';

export const fetchAllPages = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch pages');
  return response.json();
};

export const fetchSinglePage = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) throw new Error('Page not found');
  return response.json();
};

export const createPage = async (pageData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData),
  });
  if (!response.ok) throw new Error('Failed to create page');
  return response.json();
};

export const updatePage = async (id, pageData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData),
  });
  if (!response.ok) throw new Error('Failed to update page');
  return response.json();
};

export const deletePage = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete page');
  return id;
};

export const filterPagesByStatus = async (status) => {
  const url = status === 'all' ? API_BASE_URL : `${API_BASE_URL}?status=${status}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to filter pages');
  return response.json();
};
