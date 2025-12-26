import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'accounts',
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
    fetchAccountsSuccess(state, action) {
      state.accounts = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllAccounts = (branchId) => ({ type: 'accounts/fetchAll', payload: branchId });
const createAccount = (accountData) => ({ type: 'accounts/create', payload: accountData });
const updateAccount = (id, data) => ({ type: 'accounts/update', payload: { id, data } });
const deleteAccount = (id, branchId) => ({ type: 'accounts/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchAccountsSuccess,
} = accountSlice.actions;

export { fetchAllAccounts, createAccount, updateAccount, deleteAccount };

export default accountSlice.reducer;