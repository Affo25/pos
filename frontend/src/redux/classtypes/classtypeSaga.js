import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as classtypeService from './classtypeService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClassTypesSuccess,
} from './classtypeSlice';

function* fetchAllClassTypes({ payload: branchId }) {
  try {
    yield put(operationStart());
    const classtypes = yield call(classtypeService.fetchAllClassTypes, branchId);
    yield put(fetchClassTypesSuccess(classtypes));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createClassType({ payload: classtypeData }) {
  try {
    yield put(operationStart());
    yield call(classtypeService.createClassType, classtypeData);

    yield call(fetchAllClassTypes, classtypeData.branch_id);
    yield put(operationSuccess());
    toast.success("ClassType Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateClassType({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(classtypeService.updateClassType, id, data);
    yield put(operationSuccess());
    yield call(fetchAllClassTypes, { payload: data.branch_id });
    toast.success("ClassType Updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteClassType({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(classtypeService.deleteClassType, id);
    yield put(operationSuccess());
    NotificationManager.success('ClassType deleted successfully', 'Success');
    yield call(fetchAllClassTypes, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* classtypeSaga() {
  yield all([
    takeLatest('classtypes/fetchAll', fetchAllClassTypes),
    takeLatest('classtypes/create', createClassType),
    takeLatest('classtypes/update', updateClassType),
    takeLatest('classtypes/delete', deleteClassType),
  ]);
}