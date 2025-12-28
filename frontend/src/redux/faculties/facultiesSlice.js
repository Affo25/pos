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
      state.faculties = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllFaculties = () => ({
  type: 'faculties/fetchAll',
});
const createFaculties = (facultiesData) => ({ type: 'faculties/create', payload: facultiesData });
const updateFaculties = (id, data) => ({ type: 'faculties/update', payload: { id, data } });
const deleteFaculties = (id) => ({
  type: 'faculties/delete',
  payload: { id },
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



