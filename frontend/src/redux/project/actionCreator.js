import axios from 'axios';
import actions from './actions';

import { API_BASE } from '../../config/apiBase';

const API_BASE_URL = `${API_BASE}/entities`;

const {
  singleProjectBegin,
  singleProjectSuccess,
  singleProjectErr,

  filterProjectBegin,
  filterProjectSuccess,
  filterProjectErr,

} = actions;

const fetchAllProjects = () => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      const response = await axios.get(`${API_BASE_URL}`);
      dispatch(filterProjectSuccess(response.data));
    } catch (err) {
      dispatch(filterProjectErr(err.toString()));
    }
  };
};

const filterSinglePage = (paramsId) => {
  return async (dispatch) => {
    try {
      dispatch(singleProjectBegin());
      const response = await axios.get(`${API_BASE_URL}/${paramsId}`);
      dispatch(singleProjectSuccess(response.data));
    } catch (err) {
      dispatch(singleProjectErr(err));
    }
  };
};

const filterProjectByStatus = (status) => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      const response = await axios.get(`${API_BASE_URL}`);
      const data = status !== 'all'
        ? response.data.filter(project => project.status === status)
        : response.data;
      dispatch(filterProjectSuccess(data));
    } catch (err) {
      dispatch(filterProjectErr(err.toString()));
    }
  };
};

const createProject = (projectData) => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      const response = await axios.post(`${API_BASE_URL}`, projectData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterProjectSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      dispatch(filterProjectErr(err.toString()));
      throw err;
    }
  };
};

const updateProject = (id, projectData) => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      const response = await axios.put(`${API_BASE_URL}/${id}`, projectData);
      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterProjectSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      dispatch(filterProjectErr(err.toString()));
      throw err;
    }
  };
};

const deleteProject = (id) => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      await axios.delete(`${API_BASE_URL}/${id}`);
      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterProjectSuccess(listResponse.data));
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      dispatch(filterProjectErr(err.toString()));
      throw err;
    }
  };
};



export {
  fetchAllProjects,
  filterSinglePage,
  filterProjectByStatus,
  createProject,
  updateProject,
  deleteProject
};
