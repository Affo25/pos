import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as feecollectionService from './feecollectionService';
import { operationStart, operationSuccess, operationFailure, fetchFeeCollectionsSuccess } from './feecollectionSlice';

function* fetchAllFeeCollections({ payload: branchId }) {
  try {
    yield put(operationStart());
    const feecollections = yield call(feecollectionService.fetchAllFeeCollections, branchId);
    yield put(fetchFeeCollectionsSuccess(feecollections));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createFeeCollection({ payload: feecollectionData }) {
  try {
    yield put(operationStart());
    yield call(feecollectionService.createFeeCollection, feecollectionData);
    yield call(fetchAllFeeCollections, feecollectionData.branch_id);
    yield put(operationSuccess());
    toast.success('FeeCollection Created successfully 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateFeeCollection({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(feecollectionService.updateFeeCollection, id, data);
    yield put(operationSuccess());
    yield call(fetchAllFeeCollections, { payload: data.branch_id });
    toast.success('FeeCollection Updated successfullys 🎉', {
      position: 'top-right',
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteFeeCollection({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(feecollectionService.deleteFeeCollection, id);
    yield put(operationSuccess());
    NotificationManager.success('FeeCollection deleted successfully', 'Success');
    yield call(fetchAllFeeCollections, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* feecollectionSaga() {
  yield all([
    takeLatest('feecollections/fetchAll', fetchAllFeeCollections),
    takeLatest('feecollections/create', createFeeCollection),
    takeLatest('feecollections/update', updateFeeCollection),
    takeLatest('feecollections/delete', deleteFeeCollection),
  ]);
}
