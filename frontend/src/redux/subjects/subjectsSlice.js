import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subjects: [],
  loading: false,
  error: null,
};

const subjectslice = createSlice({
  name: 'subjects',
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
    fetchSubjectssuccess(state, action) {
      state.subjects = action.payload;
    },
    clearSubjectss(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllSubjects = (branchId  ) => ({ type: 'subjects/fetchAll', payload: branchId });
const createSubjects = (subjectsData) => ({ type: 'subjects/create', payload: subjectsData });
const updateSubjects = (id, data) => ({ type: 'subjects/update', payload: { id, data } });
const deleteSubjects = (id, branchId) => ({ type: 'subjects/delete', payload: { id, branchId }, });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSubjectssuccess,
  clearSubjectss,
} = subjectslice.actions;

export { fetchAllSubjects, createSubjects, updateSubjects, deleteSubjects };

export default subjectslice.reducer;