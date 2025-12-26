import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as teacherService from './teacherService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTeachersSuccess,
} from './teacherSlice';

function* fetchAllTeachers() {
  try {
    yield put(operationStart());
    const teachers = yield call(teacherService.fetchAllTeachers);
    yield put(fetchTeachersSuccess(teachers));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createTeacher({ payload: teacherData }) {
  try {
    yield put(operationStart());
    yield call(teacherService.createTeacher, teacherData);
    NotificationManager.success('Teacher created successfully', 'Success');
    yield call(fetchAllTeachers);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateTeacher({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(teacherService.updateTeacher, id, data);
    yield put(operationSuccess());
    NotificationManager.success('Teacher updated successfully', 'Success');
    yield call(fetchAllTeachers);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteTeacher({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(teacherService.deleteTeacher, id);
    yield put(operationSuccess());
    NotificationManager.success('Teacher deleted successfully', 'Success');
    yield call(fetchAllTeachers);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* teacherSaga() {
  yield all([
    takeLatest('teachers/fetchAll', fetchAllTeachers),
    takeLatest('teachers/create', createTeacher),
    takeLatest('teachers/update', updateTeacher),
    takeLatest('teachers/delete', deleteTeacher),
  ]);
}