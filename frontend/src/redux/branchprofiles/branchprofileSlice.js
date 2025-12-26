import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  branchprofiles: [],
  loading: false,
  error: null,
};

const branchprofileSlice = createSlice({
  name: 'branchprofiles',
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
    fetchBranchProfilesSuccess(state, action) {
      state.branchprofiles = action.payload;
    },
    clearBranchProfiles(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllBranchProfiles = () => ({ type: 'branchprofiles/fetchAll' });
const createBranchProfile = (branchprofileData) => ({ type: 'branchprofiles/create', payload: branchprofileData });
const updateBranchProfile = (id, data) => ({ type: 'branchprofiles/update', payload: { id, data } });
const deleteBranchProfile = (id) => ({ type: 'branchprofiles/delete', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchBranchProfilesSuccess,
  clearBranchProfiles,
} = branchprofileSlice.actions;

export { fetchAllBranchProfiles, createBranchProfile, updateBranchProfile, deleteBranchProfile };

export default branchprofileSlice.reducer;