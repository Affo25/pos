import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
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
    fetchCustomersSuccess(state, action) {
      state.customers = action.payload;
    },
  },
});

const fetchAllCustomers = () => ({ type: 'customers/fetchAll'});
const createCustomer = (customerData) => ({ type: 'customers/create', payload: customerData });
const updateCustomer = (id, data) => ({ type: 'customers/update', payload: { id, data } });
const deleteCustomer = (id) => ({ type: 'customers/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchCustomersSuccess,
} = customerSlice.actions;

export { fetchAllCustomers, createCustomer, updateCustomer, deleteCustomer };

export default customerSlice.reducer;