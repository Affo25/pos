import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as noticeService from './noticeService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchNoticesSuccess,
} from './noticeSlice';

function* fetchAllNotices({ payload: branchId }) {
  try {
    yield put(operationStart());
    const notices = yield call(noticeService.fetchAllNotices, branchId);
    yield put(fetchNoticesSuccess(notices));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createNotice({ payload: noticeData }) {
  try {
    yield put(operationStart());
    yield call(noticeService.createNotice, noticeData);
    yield call(fetchAllNotices, noticeData.branch_id);
    yield put(operationSuccess());
toast.success("Notice Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateNotice({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(noticeService.updateNotice, id, data);
    yield put(operationSuccess());
    yield call(fetchAllNotices, { payload: data.branch_id });
    toast.success("Notice updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteNotice({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(noticeService.deleteNotice, id);
    yield put(operationSuccess());
    NotificationManager.success('Notice deleted successfully', 'Success');
    yield call(fetchAllNotices, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* noticeSaga() {
  yield all([
    takeLatest('notices/fetchAll', fetchAllNotices),
    takeLatest('notices/create', createNotice),
    takeLatest('notices/update', updateNotice),
    takeLatest('notices/delete', deleteNotice),
  ]);
}