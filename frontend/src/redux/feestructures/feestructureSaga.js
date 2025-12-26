import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as feestructureService from './feestructureService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchFeeStructuresSuccess,
} from './feestructureSlice';

function* fetchAllFeeStructures({ payload: branchId }) {
  try {
    yield put(operationStart());
    const feestructures = yield call(feestructureService.fetchAllFeeStructures, branchId);
    yield put(fetchFeeStructuresSuccess(feestructures));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createFeeStructure({ payload: feestructureData }) {
  try {
    yield put(operationStart());
    yield call(feestructureService.createFeeStructure, feestructureData);
    yield call(fetchAllFeeStructures, feestructureData.branch_id);
    yield put(operationSuccess());
    toast.success("FeeStructure Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateFeeStructure({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(feestructureService.updateFeeStructure, id, data);
    yield put(operationSuccess());
    yield call(fetchAllFeeStructures, { payload: data.branch_id });
    toast.success("FeeStructure updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteFeeStructure({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(feestructureService.deleteFeeStructure, id);
    yield put(operationSuccess());
    NotificationManager.success('FeeStructure deleted successfully', 'Success');
    yield call(fetchAllFeeStructures, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* feestructureSaga() {
  yield all([
    takeLatest('feestructures/fetchAll', fetchAllFeeStructures),
    takeLatest('feestructures/create', createFeeStructure),
    takeLatest('feestructures/update', updateFeeStructure),
    takeLatest('feestructures/delete', deleteFeeStructure),
  ]);
}