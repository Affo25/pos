import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
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
    fetchTransactionsSuccess(state, action) {
      state.transactions = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllTransactions = (branchId) => ({ type: 'transactions/fetchAll', payload: branchId });
const createTransaction = (transactionData) => ({ type: 'transactions/create', payload: transactionData });
const updateTransaction = (id, data) => ({ type: 'transactions/update', payload: { id, data } });
const deleteTransaction = (id, branchId) => ({ type: 'transactions/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTransactionsSuccess,
} = transactionSlice.actions;

export { fetchAllTransactions, createTransaction, updateTransaction, deleteTransaction };

export default transactionSlice.reducer;