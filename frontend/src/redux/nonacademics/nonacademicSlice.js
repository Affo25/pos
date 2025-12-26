import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nonacademics: [],
  loading: false,
  error: null,
};

const nonacademicSlice = createSlice({
  name: 'nonacademics',
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
    fetchNonAcademicsSuccess(state, action) {
      state.nonacademics = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllNonAcademics = (branchId) => ({ type: 'nonacademics/fetchAll', payload: branchId });
const createNonAcademic = (nonacademicData) => ({ type: 'nonacademics/create', payload: nonacademicData });
const updateNonAcademic = (id, data) => ({ type: 'nonacademics/update', payload: { id, data } });
const deleteNonAcademic = (id, branchId) => ({ type: 'nonacademics/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNonAcademicsSuccess,
} = nonacademicSlice.actions;

export { fetchAllNonAcademics, createNonAcademic, updateNonAcademic, deleteNonAcademic };

export default nonacademicSlice.reducer;