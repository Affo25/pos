import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notices: [],
  loading: false,
  error: null,
};

const noticeSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    operationSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchNoticesSuccess(state, action) {
      state.notices = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllNotices = (branchId) => ({ type: 'notices/fetchAll', payload: branchId });
const createNotice = (noticeData) => ({ type: 'notices/create', payload: noticeData });
const updateNotice = (id, data) => ({ type: 'notices/update', payload: { id, data } });
const deleteNotice = (id, branchId) => ({ type: 'notices/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNoticesSuccess,
} = noticeSlice.actions;

export { fetchAllNotices, createNotice, updateNotice, deleteNotice };

export default noticeSlice.reducer;