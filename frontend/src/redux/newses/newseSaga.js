import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as newseService from './newseService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNewsesSuccess,
} from './newseSlice';

function* fetchAllNewses({ payload: branchId }) {
  try {
    yield put(operationStart());
    const newses = yield call(newseService.fetchAllNewses, branchId);
    yield put(fetchNewsesSuccess(newses));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createNewse({ payload: newseData }) {
  try {
    yield put(operationStart());
    yield call(newseService.createNewse, newseData);
    yield call(fetchAllNewses, newseData.branch_id);
    yield put(operationSuccess());
    toast.success("Newse Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateNewse({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(newseService.updateNewse, id, data);
    yield put(operationSuccess());
    yield call(fetchAllNewses, { payload: data.branch_id });
    toast.success("Newse updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteNewse({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(newseService.deleteNewse, id);
    yield put(operationSuccess());
    NotificationManager.success('Newse deleted successfully', 'Success');
    yield call(fetchAllNewses, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* newseSaga() {
  yield all([
    takeLatest('newses/fetchAll', fetchAllNewses),
    takeLatest('newses/create', createNewse),
    takeLatest('newses/update', updateNewse),
    takeLatest('newses/delete', deleteNewse),
  ]);
}