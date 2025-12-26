import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feeHeads: [],
  loading: false,
  error: null,
};

const feeHeadslice = createSlice({
  name: 'feeHeads',
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
    fetchFeeHeadsSuccess(state, action) {
      state.feeHeads = action.payload;
    },
    clearFeeHeads(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllFeeHeads = (branchId) => ({ type: 'feeHeads/fetchAll', payload: branchId });
const createFeeHeads = (feeheadsData) => ({ type: 'feeHeads/create', payload: feeheadsData });
const updateFeeHeads = (id, data) => ({ type: 'feeHeads/update', payload: { id, data } });
const deleteFeeHeads = (id, branchId) => ({ type: 'feeHeads/delete', payload: { id, branchId } });

export const { operationStart, operationSuccess, operationFailure, fetchFeeHeadsSuccess, clearFeeHeads } =
  feeHeadslice.actions;

export { fetchAllFeeHeads, createFeeHeads, updateFeeHeads, deleteFeeHeads };

export default feeHeadslice.reducer;
