import axios from 'axios';
import actions from './actions';

const API_BASE_URL = 'http://localhost:5000/api/page-data';

const {
  fetchPageDatasBegin,
  fetchPageDatasSuccess,
  fetchPageDatasErr,
  resetPageDatas,
  singlePageDataBegin,
  singlePageDataSuccess,
  singlePageDataErr
} = actions;

const createPageData = (data) => {
  return async (dispatch) => {
    try {
      dispatch(singlePageDataBegin());
      const response = await axios.post(API_BASE_URL, data);
      dispatch(singlePageDataSuccess(response.data));
      return response.data;
    } catch (err) {
      dispatch(singlePageDataErr(err.toString()));
      throw err;
    }
  };
};


const fetchPageDataByPageId = (pageId) => {
  return async (dispatch) => {
    try {
      dispatch(fetchPageDatasBegin());
      const response = await axios.get(`${API_BASE_URL}?page_id=${pageId}`);

      if (response.data && response.data.success) {
        dispatch(fetchPageDatasSuccess(response.data.data));
      } else {
        dispatch(fetchPageDatasSuccess([]));
      }

      return response.data;
    } catch (err) {
      console.error("Fetch error:", err);
      dispatch(fetchPageDatasErr(err.toString()));
      throw err;
    }
  };
};

const updatePageData = (id, data) => {
  return async (dispatch) => {
    try {
      dispatch(singlePageDataBegin());
      const response = await axios.put(`${API_BASE_URL}/${id}`, data);
      dispatch(singlePageDataSuccess(response.data));
      return response.data;
    } catch (err) {
      dispatch(singlePageDataErr(err.toString()));
      throw err;
    }
  };
};

const deletePageData = (id, pageTitle) => {
  return async (dispatch) => {
    try {
      dispatch(singlePageDataBegin());
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        data: { page_title: pageTitle }
      });

      dispatch(singlePageDataSuccess(response.data));
      return response.data;
    } catch (err) {
      dispatch(singlePageDataErr(err.toString()));
      throw err;
    }
  };
};


export {
  createPageData,
  fetchPageDataByPageId,
  updatePageData,
  deletePageData,
  resetPageDatas,
};
