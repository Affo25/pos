import axios from 'axios';
import actions from './actions';

const API_BASE_URL = 'http://localhost:5000/api/entities';

const {
  singlePageBegin,
  singlePageSuccess,
  singlePageErr,

  filterPageBegin,
  filterPageSuccess,
  filterPageErr,

} = actions;

const fetchAllPages = () => {
  return async (dispatch) => {
    try {
      dispatch(filterPageBegin());
      const response = await axios.get(`${API_BASE_URL}`);
      dispatch(filterPageSuccess(response.data));
    } catch (err) {
      dispatch(filterPageErr(err.toString()));
    }
  };
};

const filterSinglePage = (paramsId) => {
  return async (dispatch) => {
    try {
      dispatch(singlePageBegin());
      const response = await axios.get(`${API_BASE_URL}/${paramsId}`);
      dispatch(singlePageSuccess(response.data));
    } catch (err) {
      dispatch(singlePageErr(err));
    }
  };
};

const filterPageByStatus = (status) => {
  return async (dispatch) => {
    try {
      dispatch(filterPageBegin());
      const response = await axios.get(`${API_BASE_URL}`);
      const data = status !== 'all'
        ? response.data.filter(page => page.status === status)
        : response.data;
      dispatch(filterPageSuccess(data));
    } catch (err) {
      dispatch(filterPageErr(err.toString()));
    }
  };
};

const createPage = (pageData) => {
  return async (dispatch) => {
    try {
      dispatch(filterPageBegin());
      const response = await axios.post(`${API_BASE_URL}`, pageData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterPageSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      dispatch(filterPageErr(err.toString()));
      throw err;
    }
  };
};

const updatePage = (id, pageData) => {
  return async (dispatch) => {
    try {
      dispatch(filterPageBegin());
      const response = await axios.put(`${API_BASE_URL}/${id}`, pageData);
      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterPageSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      dispatch(filterPageErr(err.toString()));
      throw err;
    }
  };
};

const deletePage = (id) => {
  return async (dispatch) => {
    try {
      dispatch(filterPageBegin());
      await axios.delete(`${API_BASE_URL}/${id}`);
      const listResponse = await axios.get(`${API_BASE_URL}`);
      dispatch(filterPageSuccess(listResponse.data));
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      dispatch(filterPageErr(err.toString()));
      throw err;
    }
  };
};



export {
  fetchAllPages,
  filterSinglePage,
  filterPageByStatus,
  createPage,
  updatePage,
  deletePage
};
