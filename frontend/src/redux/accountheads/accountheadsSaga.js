import { toast } from 'react-toastify';
import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as accountheadservice from './accountheadsService';
import { operationStart, operationSuccess, operationFailure, fetchAccountheadsuccess } from './accountheadsSlice';

function* fetchAllAccountheads({ payload: branchId }) {
  try {
    yield put(operationStart());
    const accountheads = yield call(accountheadservice.fetchAllAccountHeads, branchId);
    yield put(fetchAccountheadsuccess(accountheads));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createAccountHeads({ payload: accountheadsData }) {
  try {
    yield put(operationStart());
    yield call(accountheadservice.createAccountHeads, accountheadsData);
    yield call(fetchAllAccountheads, { payload: accountheadsData.branch_id });
    yield put(operationSuccess());
toast.success("AccountHeads Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateAccountHeads({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(accountheadservice.updateAccountHeads, id, data);
    yield put(operationSuccess());
    toast.success("AccountHeads updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllAccountheads, { payload: data.branch_id });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteAccountHeads({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(accountheadservice.deleteAccountHeads, id);
    yield put(operationSuccess());
    NotificationManager.success('AccountHeads deleted successfully', 'Success');
    yield call(fetchAllAccountheads, { id, payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* accountheadsaga() {
  yield all([
    takeLatest('accountheads/fetchAll', fetchAllAccountheads),
    takeLatest('accountheads/create', createAccountHeads),
    takeLatest('accountheads/update', updateAccountHeads),
    takeLatest('accountheads/delete', deleteAccountHeads),
  ]);
}
