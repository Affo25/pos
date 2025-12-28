// redux/auth/authSaga.js
import { call, put, takeLatest } from 'redux-saga/effects';
import Cookies from 'js-cookie';
import { NotificationManager } from 'react-notifications';
import * as authService from './authService';
import { loginStart, loginSuccess, loginFailure, logoutStart, logoutSuccess, logoutFailure } from './authSlice';
import { clearBranchProfiles } from '../branchprofiles/branchprofileSlice';
import { clearFaculties } from '../faculties/facultiesSlice';

function* loginUser({ payload }) {
  try {
    yield put(loginStart());
    const { email, password } = payload;
    const response = yield call(authService.loginUser, email, password);
    Cookies.set('logedIn', true);
    Cookies.set('token', response.token);
    yield put(loginSuccess(response));
    NotificationManager.success('Login Successful', 'Success');
  } catch (error) {
    yield put(loginFailure(error.response?.data?.message || error.message));
    NotificationManager.error('Login Failed', 'Error');
  }
}

function* logoutUser() {
  try {
    yield put(logoutStart());
    yield call(authService.logoutUser);
    Cookies.remove('logedIn');
    Cookies.remove('token');
    localStorage.removeItem('loginData');
    yield put(clearFaculties());
    yield put(clearBranchProfiles());
    yield put(logoutSuccess());
    NotificationManager.success('Logout Successful', 'Success');
  } catch (error) {
    yield put(logoutFailure(error.message));
    NotificationManager.error('Logout Failed', 'Error');
  }
}

export default function* authSaga() {
  yield takeLatest('auth/loginUser', loginUser);
  yield takeLatest('auth/logoutUser', logoutUser);
}
