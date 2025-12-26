import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as nonacademicService from './nonacademicService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNonAcademicsSuccess,
} from './nonacademicSlice';

function* fetchAllNonAcademics({ payload: branchId }) {
  try {
    yield put(operationStart());
    const nonacademics = yield call(nonacademicService.fetchAllNonAcademics, branchId);
    yield put(fetchNonAcademicsSuccess(nonacademics));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createNonAcademic({ payload: nonacademicData }) {
  try {
    yield put(operationStart());
    yield call(nonacademicService.createNonAcademic, nonacademicData);
    toast.success("NonAcademic Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllNonAcademics, { payload: nonacademicData.branch_id });
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateNonAcademic({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(nonacademicService.updateNonAcademic, id, data);
    yield put(operationSuccess());
    yield call(fetchAllNonAcademics, { payload: data.branch_id });
    toast.success("NonAcademic updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteNonAcademic({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(nonacademicService.deleteNonAcademic, id);
    yield put(operationSuccess());
    NotificationManager.success('NonAcademic deleted successfully', 'Success');
    yield call(fetchAllNonAcademics, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* nonacademicSaga() {
  yield all([
    takeLatest('nonacademics/fetchAll', fetchAllNonAcademics),
    takeLatest('nonacademics/create', createNonAcademic),
    takeLatest('nonacademics/update', updateNonAcademic),
    takeLatest('nonacademics/delete', deleteNonAcademic),
  ]);
}