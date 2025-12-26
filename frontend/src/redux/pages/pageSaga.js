// redux/page/pageSaga.js
import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as pageService from './pageService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPagesSuccess,
  fetchSinglePageSuccess,
} from './pageSlice';

function* fetchAllPages() {
  try {
    yield put(operationStart());
    const pages = yield call(pageService.fetchAllPages);
    yield put(fetchPagesSuccess(pages));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* fetchSinglePage({ payload: id }) {
  try {
    yield put(operationStart());
    const page = yield call(pageService.fetchSinglePage, id);
    yield put(fetchSinglePageSuccess(page));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createPage({ payload: pageData }) {
  try {
    yield put(operationStart());
    yield call(pageService.createPage, pageData);
    NotificationManager.success('Page created successfully', 'Success');
    yield call(fetchAllPages);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updatePage({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(pageService.updatePage, id, data);
    yield put(operationSuccess());
    NotificationManager.success('Page updated successfully', 'Success');
    yield call(fetchAllPages);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deletePage({ id }) {
  try {
    yield put(operationStart());
    yield call(pageService.deletePage, id);
    yield put(operationSuccess());
    NotificationManager.success('Page deleted successfully', 'Success');
    yield call(fetchAllPages);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* filterPages({ payload: status }) {
  try {
    yield put(operationStart());

    const filteredPages = yield call(pageService.filterPagesByStatus, status);
    yield put(fetchPagesSuccess(filteredPages));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* pageSaga() {
  yield all([
    takeLatest('pages/fetchAll', fetchAllPages),
    takeLatest('pages/fetchSingle', fetchSinglePage),
    takeLatest('pages/create', createPage),
    takeLatest('pages/update', updatePage),
    takeLatest('pages/delete', deletePage),
    takeLatest('pages/filterByStatus', filterPages),
  ]);
}
