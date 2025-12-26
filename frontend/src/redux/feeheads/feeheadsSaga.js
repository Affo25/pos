import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as feeHeadservice from './feeheadsService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchFeeHeadsSuccess,
} from './feeheadsSlice';

function* fetchAllFeeHeads({ payload: branchId }) {
  try {
    yield put(operationStart());
    const feeHeads = yield call(feeHeadservice.fetchAllFeeHeads, branchId);
    yield put(fetchFeeHeadsSuccess(feeHeads));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createFeeHeads({ payload: feeheadsData }) {
  try {
    yield put(operationStart());
    yield call(feeHeadservice.createFeeHeads, feeheadsData);
    yield call(fetchAllFeeHeads, { payload: feeheadsData.branch_id });
    yield put(operationSuccess());
    toast.success("FeeHeads Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateFeeHeads({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(feeHeadservice.updateFeeHeads, id, data);
    yield put(operationSuccess());
    yield call(fetchAllFeeHeads, { payload: data.branch_id });
    toast.success("FeeHeads updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteFeeHeads({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(feeHeadservice.deleteFeeHeads, id);
    yield put(operationSuccess());
    NotificationManager.success('FeeHeads deleted successfully', 'Success');
    yield call(fetchAllFeeHeads, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* feeHeadsaga() {
  yield all([
    takeLatest('feeHeads/fetchAll', fetchAllFeeHeads),
    takeLatest('feeHeads/create', createFeeHeads),
    takeLatest('feeHeads/update', updateFeeHeads),
    takeLatest('feeHeads/delete', deleteFeeHeads),
  ]);
}