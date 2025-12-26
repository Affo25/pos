// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  loading: false,
  error: null,
  currentUser: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    operationSuccess(state) {
      state.loading = false;
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUsersSuccess(state, action) {
      state.users = action.payload;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },
    changePasswordSuccess(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearUsers(state) {
      state.users = [];
      state.currentUser = null;
    }
  },
});

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchUsersSuccess,
  setCurrentUser,
  clearUsers,
  changePasswordSuccess
} = userSlice.actions;

export const fetchAllUsers = () => ({ type: 'users/fetchAll' });
export const createUser = (userData) => ({ type: 'users/create', payload: userData });
export const updateUser = (id, data) => ({ type: 'users/update', payload: { id, data } });
export const deleteUser = (id) => ({ type: 'users/delete', payload: id });
export const changePassword = (userData) => ({ type: 'users/changePassword', payload: userData });

export default userSlice.reducer;