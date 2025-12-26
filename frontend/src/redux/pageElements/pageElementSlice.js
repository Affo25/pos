// redux/pageElement/pageElementSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pageElements: [],
  current: null,
  loading: false,
  error: null,
};

const pageElementSlice = createSlice({
  name: 'pageElements',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    operationSuccess(state) {
      state.loading = false;
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchListSuccess(state, action) {
      state.pageElements = action.payload;
    },
    fetchSingleSuccess(state, action) {
      state.current = action.payload;
    },
    resetPageElements(state) {
      state.currentPage = null;
      state.error = null;
    },
  },
});

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchListSuccess,
  fetchSingleSuccess,
  resetPageElements,
} = pageElementSlice.actions;

export const fetchAllPageElements = (pageId) => ({ type: 'pageElements/fetchAll', payload: pageId });
export const fetchPageElementById = (id) => ({ type: 'pageElements/fetchOne', payload: id });
export const createPageElement = (data) => ({ type: 'pageElements/create', payload: data });
export const updatePageElement = (id, data) => ({ type: 'pageElements/update', payload: { id, data } });
export const deletePageElement = (id, pageId) => ({ type: 'pageElements/delete', payload: { id, pageId } });

export default pageElementSlice.reducer;
