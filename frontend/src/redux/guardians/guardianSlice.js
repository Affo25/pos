import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  guardians: [],
  loading: false,
  error: null,
};

const guardianSlice = createSlice({
  name: 'guardians',
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
    fetchGuardiansSuccess(state, action) {
      state.guardians = action.payload;
    },
    clearGuardians(state) {
      state.guardians = [];
    },
    clearError(state) {

      state.error = null;
    },
  },
});

const fetchAllGuardians = (branchId) => ({ type: 'guardians/fetchAll', payload: branchId });
const createGuardian = (guardianData) => ({ type: 'guardians/create', payload: guardianData });
const updateGuardian = (id, data) => ({ type: 'guardians/update', payload: { id, data } });
const deleteGuardian = (id, branchId) => ({ type: 'guardians/delete', payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchGuardiansSuccess,
  clearGuardians
} = guardianSlice.actions;

export { fetchAllGuardians, createGuardian, updateGuardian, deleteGuardian };

export default guardianSlice.reducer;




// /* eslint-disable no-param-reassign */
// import { createSlice } from '@reduxjs/toolkit';
// import { createSelector } from 'reselect';

// const guardianSlice = createSlice({
//   name: 'guardian',
//   initialState: {
//     loading: false,
//     guardians: [],
//   },
//   reducers: {
//     getGuardians(state) {
//       return { ...state };
//     },
//     setGuardians(state, action) {
//       state.guardians = action.payload;
//     },
//     setIsLoading(state, action) {
//       state.loading = action.payload;
//     },
//     createGuardian(state) {
//       return { ...state };
//     },
//     updateGuardian(state) {
//       return { ...state };
//     },
//     deleteGuardian(state) {
//       return { ...state };
//     },
//   },
// });

// export const {
//   getGuardians,
//   setGuardians,
//   setIsLoading,
//   createGuardian,
//   updateGuardian,
//   deleteGuardian,
// } = guardianSlice.actions;

// export default guardianSlice.reducer;

// export const getAvailableGuardians = createSelector(
//   (state) => state.guardian.guardians,
//   (guardians) => guardians
// );
