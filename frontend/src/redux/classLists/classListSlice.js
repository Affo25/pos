import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classLists: [],
  loading: false,
  error: null,
};

const classListslice = createSlice({
  name: 'classLists',
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
    fetchClassListsSuccess(state, action) {
      state.classLists = action.payload;
    },

  clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllClassLists = (branchId) => ({ type: 'classLists/fetchAll', payload: branchId });
const createClassList = (classListData) => ({ type: 'classLists/create', payload: classListData });
const updateClassList = (id, data) => ({ type: 'classLists/update', payload: { id, data } });
const deleteClassList = (id, branchId) => ({ type: 'classLists/delete', payload: { id, branchId } });

export const { operationStart, operationSuccess, operationFailure, fetchClassListsSuccess } = classListslice.actions;

export { fetchAllClassLists, createClassList, updateClassList, deleteClassList };

export default classListslice.reducer;
