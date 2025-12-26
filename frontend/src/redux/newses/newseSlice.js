import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  newses: [],
  loading: false,
  error: null,
};

const newseSlice = createSlice({
  name: 'newses',
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
    fetchNewsesSuccess(state, action) {
      state.newses = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllNewses = (branchId) => ({ type: 'newses/fetchAll', payload: branchId });
const createNewse = (newseData) => ({ type: 'newses/create', payload: newseData });
const updateNewse = (id, data) => ({ type: 'newses/update', payload: { id, data } });
const deleteNewse = (id, branchId) => ({ type: 'newses/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNewsesSuccess,
} = newseSlice.actions;

export { fetchAllNewses, createNewse, updateNewse, deleteNewse };

export default newseSlice.reducer;