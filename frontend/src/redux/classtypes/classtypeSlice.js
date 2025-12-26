import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classtypes: [],
  loading: false,
  error: null,
};

const classtypeSlice = createSlice({
  name: 'classtypes',
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
    fetchClassTypesSuccess(state, action) {
      state.classtypes = action.payload;
    },
    clearClassTypes(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllClassTypes = (branchId) => ({ type: 'classtypes/fetchAll', payload: branchId });
const createClassType = (classtypeData) => ({ type: 'classtypes/create', payload: classtypeData });
const updateClassType = (id, data) => ({ type: 'classtypes/update', payload: { id, data } });
const deleteClassType = (id, branchId) => ({ type: 'classtypes/delete',  payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClassTypesSuccess,
  clearClassTypes,
} = classtypeSlice.actions;

export { fetchAllClassTypes, createClassType, updateClassType, deleteClassType };

export default classtypeSlice.reducer;