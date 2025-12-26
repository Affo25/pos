// redux/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const savedLogin = localStorage.getItem('loginData');
const token = Cookies.get('token');
const isValidToken = token && token.split('.').length === 3;
const initialState = {
  login: isValidToken && savedLogin ? JSON.parse(savedLogin) : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.login = action.payload;
      state.loading = false;
      localStorage.setItem('loginData', JSON.stringify(action.payload));

    },
    loginFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    logoutStart(state) {
      state.loading = true;
    },
    logoutSuccess(state) {
      state.login = null;
      state.loading = false;
      localStorage.removeItem('loginData');
    },
    logoutFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
} = authSlice.actions;

export const loginUser = (payload) => ({ type: 'auth/loginUser', payload });
export const logoutUser = () => ({ type: 'auth/logoutUser' });

export default authSlice.reducer;
