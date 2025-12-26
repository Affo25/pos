import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as accountService from './accountService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchAccountsSuccess,
} from './accountSlice';

function* fetchAllAccounts({ payload: branchId }) {
  try {
    yield put(operationStart());
    const accounts = yield call(accountService.fetchAllAccounts, branchId);
    yield put(fetchAccountsSuccess(accounts));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createAccount({ payload: accountData }) {
  try {
    yield put(operationStart());
    yield call(accountService.createAccount, accountData);
    yield call(fetchAllAccounts, accountData.branch_id);
    yield put(operationSuccess());
    toast.success("Account Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateAccount({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(accountService.updateAccount, id, data);
    yield put(operationSuccess());
    yield call(fetchAllAccounts, { payload: data.branch_id });
    toast.success("BranchProfile updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteAccount({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(accountService.deleteAccount, id);
    yield put(operationSuccess());
    NotificationManager.success('Account deleted successfully', 'Success');
    yield call(fetchAllAccounts, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* accountSaga() {
  yield all([
    takeLatest('accounts/fetchAll', fetchAllAccounts),
    takeLatest('accounts/create', createAccount),
    takeLatest('accounts/update', updateAccount),
    takeLatest('accounts/delete', deleteAccount),
  ]);
}