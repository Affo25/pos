import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suppliers: [],
  loading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: 'suppliers',
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
    fetchSuppliersSuccess(state, action) {
      state.suppliers = action.payload;
    },
  },
});

const fetchAllSuppliers = () => ({ type: 'suppliers/fetchAll'});
const createSupplier = (supplierData) => ({ type: 'suppliers/create', payload: supplierData });
const updateSupplier = (id, data) => ({ type: 'suppliers/update', payload: { id, data } });
const deleteSupplier = (id) => ({ type: 'suppliers/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSuppliersSuccess,
} = supplierSlice.actions;

export { fetchAllSuppliers, createSupplier, updateSupplier, deleteSupplier };

export default supplierSlice.reducer;