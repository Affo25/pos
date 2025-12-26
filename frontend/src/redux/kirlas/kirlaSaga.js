import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as kirlaService from './kirlaService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchKirlasSuccess,
} from './kirlaSlice';

function* fetchAllKirlas() {
  try {
    yield put(operationStart());
    const kirlas = yield call(kirlaService.fetchAllKirlas);
    yield put(fetchKirlasSuccess(kirlas));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createKirla({ payload: kirlaData }) {
  try {
    yield put(operationStart());
    yield call(kirlaService.createKirla, kirlaData);
    NotificationManager.success('Kirla created successfully', 'Success');
    yield call(fetchAllKirlas);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateKirla({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(kirlaService.updateKirla, id, data);
    yield put(operationSuccess());
    NotificationManager.success('Kirla updated successfully', 'Success');
    yield call(fetchAllKirlas);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteKirla({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(kirlaService.deleteKirla, id);
    yield put(operationSuccess());
    NotificationManager.success('Kirla deleted successfully', 'Success');
    yield call(fetchAllKirlas);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* kirlaSaga() {
  yield all([
    takeLatest('kirlas/fetchAll', fetchAllKirlas),
    takeLatest('kirlas/create', createKirla),
    takeLatest('kirlas/update', updateKirla),
    takeLatest('kirlas/delete', deleteKirla),
  ]);
}