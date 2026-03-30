import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  purchaseorders: [],
  loading: false,
  error: null,
};

const purchaseorderSlice = createSlice({
  name: 'purchaseorders',
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
    fetchPurchaseOrdersSuccess(state, action) {
      state.purchaseorders = action.payload;
    },
  },
});

const fetchAllPurchaseOrders = () => ({ type: 'purchaseorders/fetchAll'});
const createPurchaseOrder = (purchaseorderData) => ({ type: 'purchaseorders/create', payload: purchaseorderData });
const updatePurchaseOrder = (id, data) => ({ type: 'purchaseorders/update', payload: { id, data } });
const deletePurchaseOrder = (id) => ({ type: 'purchaseorders/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPurchaseOrdersSuccess,
} = purchaseorderSlice.actions;

export { fetchAllPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder };

export default purchaseorderSlice.reducer;