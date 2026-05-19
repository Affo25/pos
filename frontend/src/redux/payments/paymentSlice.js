import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
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
    fetchPaymentsSuccess(state, action) {
      state.payments = action.payload;
    },
  },
});

const fetchAllPayments = (filters) => ({ type: 'payments/fetchAll', payload: filters });
const createPayment = (paymentData) => ({ type: 'payments/create', payload: paymentData });
const cancelPayment = (id) => ({ type: 'payments/cancel', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPaymentsSuccess,
} = paymentSlice.actions;

export { fetchAllPayments, createPayment, cancelPayment };

export default paymentSlice.reducer;
