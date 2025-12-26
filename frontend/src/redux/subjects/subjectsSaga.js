import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as subjectservice from './subjectsService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSubjectssuccess,
} from './subjectsSlice';

function* fetchAllSubjects({ payload: branchId }) {
  try {
    yield put(operationStart());
    const subjects = yield call(subjectservice.fetchAllSubjects, branchId);
    yield put(fetchSubjectssuccess(subjects));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createSubjects({ payload: subjectsData }) {
  try {
    yield put(operationStart());
    yield call(subjectservice.createSubjects, subjectsData);
    yield call(fetchAllSubjects, { payload: subjectsData.branch_id });
    yield put(operationSuccess());
    toast.success("Subjects Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateSubjects({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(subjectservice.updateSubjects, id, data);
    yield put(operationSuccess());
    yield call(fetchAllSubjects, { payload: data.branch_id });
    toast.success("Subjects updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteSubjects({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(subjectservice.deleteSubjects, id);
    yield put(operationSuccess());
    NotificationManager.success('Subjects deleted successfully', 'Success');
    yield call(fetchAllSubjects, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* subjectsaga() {
  yield all([
    takeLatest('subjects/fetchAll', fetchAllSubjects),
    takeLatest('subjects/create', createSubjects),
    takeLatest('subjects/update', updateSubjects),
    takeLatest('subjects/delete', deleteSubjects),
  ]);
}