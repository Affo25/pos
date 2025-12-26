import axios from 'axios';
import actions from './actions';

const API_BASE_URL = 'http://localhost:5000/api/page-elements';

const {
  singlePageElementBegin,
  singlePageElementSuccess,
  singlePageElementErr,

  fetchPageElementsBegin,
  fetchPageElementsSuccess,
  fetchPageElementsErr,

  resetPageElements,
} = actions;

const fetchAllPageElements = (pageId) => {
  return async (dispatch) => {
    try {
      dispatch(fetchPageElementsBegin());
      const response = await axios.get(`${API_BASE_URL}?page_id=${pageId}`);
      dispatch(fetchPageElementsSuccess(response.data));
    } catch (err) {
      dispatch(fetchPageElementsErr(err.toString()));
    }
  };
};
const fetchPageElementById = (id) => {
  return async (dispatch) => {
    try {
      dispatch(singlePageElementBegin());
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      dispatch(singlePageElementSuccess(response.data));
    } catch (err) {
      dispatch(singlePageElementErr(err.toString()));
    }
  };
};

const createPageElement = (data) => {
  return async (dispatch) => {
    try {
      dispatch(fetchPageElementsBegin());
      const response = await axios.post(API_BASE_URL, data);
      const listResponse = await axios.get(`${API_BASE_URL}?page_id=${data.page_id}`);
      dispatch(fetchPageElementsSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      dispatch(fetchPageElementsErr(err.toString()));
      throw err;
    }
  };
};

const updatePageElement = (id, data) => {
  return async (dispatch) => {
    try {
      dispatch(fetchPageElementsBegin());
      const response = await axios.put(`${API_BASE_URL}/${id}`, data);
      const listResponse = await axios.get(`${API_BASE_URL}?page_id=${data.page_id}`);
      dispatch(fetchPageElementsSuccess(listResponse.data));
      return response.data;
    } catch (err) {
      dispatch(fetchPageElementsErr(err.toString()));
      throw err;
    }
  };
};

const deletePageElement = (id, pageId) => {
  return async (dispatch) => {
    try {
      dispatch(fetchPageElementsBegin());
      await axios.delete(`${API_BASE_URL}/${id}`);
      const listResponse = await axios.get(`${API_BASE_URL}?page_id=${pageId}`);
      dispatch(fetchPageElementsSuccess(listResponse.data));
    } catch (err) {
      dispatch(fetchPageElementsErr(err.toString()));
      throw err;
    }
  };
};



export {
  fetchAllPageElements,
  fetchPageElementById,
  createPageElement,
  updatePageElement,
  deletePageElement,
  resetPageElements,
};
