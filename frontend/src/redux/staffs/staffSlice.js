import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staffs: [],
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: 'staffs',
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
    fetchStaffsSuccess(state, action) {
      state.staffs = action.payload;
    },
    clearStaffs(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllStaffs = (branchId) => ({ type: 'staffs/fetchAll', payload: branchId });
const createStaff = (staffData) => ({ type: 'staffs/create', payload: staffData });
const updateStaff = (id, data) => ({ type: 'staffs/update', payload: { id, data } });
const deleteStaff = (id, branchId) => ({ type: 'staffs/delete', payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchStaffsSuccess,
  clearStaffs,
} = staffSlice.actions;

export { fetchAllStaffs, createStaff, updateStaff, deleteStaff };

export default staffSlice.reducer;