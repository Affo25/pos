import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as classattendanceService from './classattendanceService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClassAttendancesSuccess,
  fetchClassAttendanceSummarySuccess,
} from './classattendanceSlice';

function* fetchAllClassAttendances({ payload }) {
  try {
    yield put(operationStart());
    const classattendances = yield call(
      classattendanceService.fetchAllClassAttendances,
      payload
    );
    yield put(fetchClassAttendancesSuccess(classattendances));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}


function* createClassAttendance({ payload: classattendanceData }) {
  try {
    yield put(operationStart());
    yield call(classattendanceService.createClassAttendance, classattendanceData);
    NotificationManager.success('ClassAttendance created successfully', 'Success');
    // yield call(fetchAllClassAttendances, { payload: { branch_id: classattendanceData.branch_id } });
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateClassAttendance({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(classattendanceService.updateClassAttendance, id, data);
    yield put(operationSuccess());
    NotificationManager.success('ClassAttendance updated successfully', 'Success');
    // yield call(fetchAllClassAttendances, { payload: { branch_id: data.branch_id } });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteClassAttendance({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(classattendanceService.deleteClassAttendance, id);
    yield put(operationSuccess());
    NotificationManager.success('ClassAttendance deleted successfully', 'Success');
    yield call(fetchAllClassAttendances, { payload: { branch_id: branchId } });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* fetchClassAttendanceSummary({ payload }) {
  try {
    yield put(operationStart());
    const summary = yield call(classattendanceService.getClassAttendanceSummary, payload);
    yield put(fetchClassAttendanceSummarySuccess(summary));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}


export default function* classattendanceSaga() {
  yield all([
    takeLatest('classattendances/fetchAll', fetchAllClassAttendances),
    takeLatest('classattendances/create', createClassAttendance),
    takeLatest('classattendances/update', updateClassAttendance),
    takeLatest('classattendances/delete', deleteClassAttendance),
    takeLatest('classattendances/fetchSummary', fetchClassAttendanceSummary),
  ]);
}