import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  faculties: [],
  loading: false,
  error: null,
};

const facultieslice = createSlice({
  name: 'faculties',
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
    fetchFacultiesuccess(state, action) {
      state.faculties = action.payload;
    },
    clearFaculties(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllFaculties = (branchId) => ({
  type: 'faculties/fetchAll',
  payload: branchId,
});
const createFaculties = (facultiesData) => ({ type: 'faculties/create', payload: facultiesData });
const updateFaculties = (id, data) => ({ type: 'faculties/update', payload: { id, data } });
const deleteFaculties = (id, branchId) => ({
  type: 'faculties/delete',
  payload: { id, branchId },
});


export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchFacultiesuccess,
  clearFaculties,
  clearError
} = facultieslice.actions;

export { fetchAllFaculties, createFaculties, updateFaculties, deleteFaculties };

export default facultieslice.reducer;



