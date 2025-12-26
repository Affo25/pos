// redux/page/pageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const pageSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },

    operationSuccess(state) {
      state.loading = false
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPagesSuccess(state, action) {
      state.pages = action.payload;
    },
    fetchSinglePageSuccess(state, action) {
      state.currentPage = action.payload;
    },
    resetPageState(state) {
      state.currentPage = null;
      state.error = null;
    },
  },
});

const fetchAllPages = () => ({ type: 'pages/fetchAll' });
const fetchSinglePage = (id) => ({ type: 'pages/fetchSingle', payload: id });
const createPage = (pageData) => ({ type: 'pages/create', payload: pageData });
const updatePage = (id, data) => ({ type: 'pages/update', payload: { id, data } });
const deletePage = (id) => ({
  type: 'pages/delete',
  id,
});

const filterPagesByStatus = (status) => ({ type: 'pages/filterByStatus', payload: status });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPagesSuccess,
  fetchSinglePageSuccess,
  resetPageState,
} = pageSlice.actions;

export { fetchAllPages, fetchSinglePage, createPage, updatePage, deletePage, filterPagesByStatus };

export default pageSlice.reducer;
