import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feecollections: [],
  loading: false,
  error: null,
};

const feecollectionSlice = createSlice({
  name: 'feecollections',
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
    fetchFeeCollectionsSuccess(state, action) {
      state.feecollections = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllFeeCollections = (branchId) => ({ type: 'feecollections/fetchAll', payload: branchId });
const createFeeCollection = (feecollectionData) => ({ type: 'feecollections/create', payload: feecollectionData });
const updateFeeCollection = (id, data) => ({ type: 'feecollections/update', payload: { id, data } });
const deleteFeeCollection = (id, branchId) => ({ type: 'feecollections/delete', payload: { id, branchId } });

export const { operationStart, operationSuccess, operationFailure, fetchFeeCollectionsSuccess } =
  feecollectionSlice.actions;

export { fetchAllFeeCollections, createFeeCollection, updateFeeCollection, deleteFeeCollection };

export default feecollectionSlice.reducer;
