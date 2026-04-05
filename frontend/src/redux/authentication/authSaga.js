// redux/auth/authSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import Cookies from 'js-cookie';
import { message } from 'antd';
import * as authService from './authService';
import { loginStart, loginSuccess, loginFailure, logoutStart, logoutSuccess, logoutFailure } from './authSlice';
import { clearBranchProfiles } from '../branchprofiles/branchprofileSlice';

function loginErrorText(error) {
  const data = error.response?.data;
  return (
    data?.message ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    error.message ||
    'Unable to sign in. Please try again.'
  );
}

function* loginUser({ payload }) {
  try {
    yield put(loginStart());
    const { email, password } = payload;
    const response = yield call(authService.loginUser, email, password);
    Cookies.set('logedIn', true);
    Cookies.set('token', response.token);
    yield put(loginSuccess(response));
    message.success('Signed in successfully.');
  } catch (error) {
    const errMsg = loginErrorText(error);
    yield put(loginFailure(errMsg));
    message.error(errMsg);
  }
}

function* logoutUser() {
  try {
    yield put(logoutStart());
    yield call(authService.logoutUser);
    Cookies.remove('logedIn');
    Cookies.remove('token');
    localStorage.removeItem('loginData');
    yield put(clearBranchProfiles());
    yield put(logoutSuccess());
    message.success('Signed out successfully.');
  } catch (error) {
    const errMsg = error?.message || 'Sign out failed.';
    yield put(logoutFailure(errMsg));
    message.error(errMsg);
  }
}

export default function* authSaga() {
  yield takeLatest('auth/loginUser', loginUser);
  yield takeLatest('auth/logoutUser', logoutUser);
}
