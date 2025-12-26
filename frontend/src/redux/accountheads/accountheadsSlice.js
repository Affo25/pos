import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accountheads: [],
  loading: false,
  error: null,
};

const accountheadslice = createSlice({
  name: 'accountheads',
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
    fetchAccountheadsuccess(state, action) {
      state.accountheads = action.payload;
    },
     
    clearAccountheads(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllAccountheads = (branchId) => ({ type: 'accountheads/fetchAll', payload: branchId });
const createAccountHeads = (accountheadsData) => ({ type: 'accountheads/create', payload: accountheadsData });
const updateAccountHeads = (id, data) => ({ type: 'accountheads/update', payload: { id, data } });
const deleteAccountHeads = (id, branchId) => ({ type: 'accountheads/delete', payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchAccountheadsuccess,
  clearAccountheads,
} = accountheadslice.actions;

export { fetchAllAccountheads, createAccountHeads, updateAccountHeads, deleteAccountHeads };

export default accountheadslice.reducer;