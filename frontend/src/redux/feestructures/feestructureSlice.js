import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feestructures: [],
  loading: false,
  error: null,
};

const feestructureSlice = createSlice({
  name: 'feestructures',
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
    fetchFeeStructuresSuccess(state, action) {
      state.feestructures = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllFeeStructures = (branchId) => ({ type: 'feestructures/fetchAll', payload: branchId });
const createFeeStructure = (feestructureData) => ({ type: 'feestructures/create', payload: feestructureData });
const updateFeeStructure = (id, data) => ({ type: 'feestructures/update', payload: { id, data } });
const deleteFeeStructure = (id, branchId) => ({ type: 'feestructures/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchFeeStructuresSuccess,
} = feestructureSlice.actions;

export { fetchAllFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure };

export default feestructureSlice.reducer;