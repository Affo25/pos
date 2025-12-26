import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as classListservice from './classListService';
import { operationStart, operationSuccess, operationFailure, fetchClassListsSuccess } from './classListSlice';

function* fetchAllClassLists({ payload: branchId }) {
  try {
    yield put(operationStart());
    const classLists = yield call(classListservice.fetchAllClassLists, branchId);
    yield put(fetchClassListsSuccess(classLists));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createClassList({ payload: classListData }) {
  try {
    yield put(operationStart());
    yield call(classListservice.createClassList, classListData);
    yield call(fetchAllClassLists, classListData.branch_id);
    yield put(operationSuccess());
    toast.success("ClassList Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateClassList({ payload: { id, data } }) {
  try {
    console.log(data, 'dds');
    yield put(operationStart());
    yield call(classListservice.updateClassList, id, data);
    yield put(operationSuccess());
    yield call(fetchAllClassLists, { payload: data.branch_id });
    toast.success("ClassList updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteClassList({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(classListservice.deleteClassList, id);
    yield put(operationSuccess());
    NotificationManager.success('ClassList deleted successfully', 'Success');
    yield call(fetchAllClassLists, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* classListsaga() {
  yield all([
    takeLatest('classLists/fetchAll', fetchAllClassLists),
    takeLatest('classLists/create', createClassList),
    takeLatest('classLists/update', updateClassList),
    takeLatest('classLists/delete', deleteClassList),
  ]);
}
