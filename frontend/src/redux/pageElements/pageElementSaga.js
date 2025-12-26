// redux/pageElement/pageElementSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';

import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchListSuccess,
  fetchSingleSuccess,
} from './pageElementSlice';
import * as service from './pageElementService';

function* fetchAllPageElements({ payload: pageId }) {
  try {
    yield put(operationStart());
    const data = yield call(service.fetchAllPageElements, pageId);
    yield put(fetchListSuccess(data));
    yield put(operationSuccess());
  } catch (err) {
    yield put(operationFailure(err.message));
    NotificationManager.error(err.message, 'Fetch Error');
  }
}

function* fetchOne({ payload: id }) {
  try {
    yield put(operationStart());
    const data = yield call(service.fetchById, id);
    yield put(fetchSingleSuccess(data));
    yield put(operationSuccess());
  } catch (err) {
    yield put(operationFailure(err.message));
    NotificationManager.error(err.message, 'Fetch Error');
  }
}

function* create({ payload: data }) {
  try {
    yield put(operationStart());
    yield call(service.create, data);
    const updatedList = yield call(service.fetchAllPageElements, data.page_id);
    yield put(fetchListSuccess(updatedList));
    NotificationManager.success('Created successfully', 'Success');
    yield put(operationSuccess());
  } catch (err) {
    yield put(operationFailure(err.message));
    NotificationManager.error(err.message, 'Create Error');
  }
}

function* update({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(service.update, id, data);
    const updatedList = yield call(service.fetchAllPageElements, data.page_id);
    yield put(fetchListSuccess(updatedList));
    NotificationManager.success('Updated successfully', 'Success');
    yield put(operationSuccess());
  } catch (err) {
    yield put(operationFailure(err.message));
    NotificationManager.error(err.message, 'Update Error');
  }
}

function* remove({ payload: { id, pageId } }) {
  try {
    yield put(operationStart());
    yield call(service.remove, id);
    const updatedList = yield call(service.fetchAllPageElements, pageId);
    yield put(fetchListSuccess(updatedList));
    NotificationManager.success('Deleted successfully', 'Success');
    yield put(operationSuccess());
  } catch (err) {
    yield put(operationFailure(err.message));
    NotificationManager.error(err.message, 'Delete Error');
  }
}

export default function* pageElementSaga() {
  yield all([
    takeLatest('pageElements/fetchAll', fetchAllPageElements),
    takeLatest('pageElements/fetchOne', fetchOne),
    takeLatest('pageElements/create', create),
    takeLatest('pageElements/update', update),
    takeLatest('pageElements/delete', remove),
  ]);
}
