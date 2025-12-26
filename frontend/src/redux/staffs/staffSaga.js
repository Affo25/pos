import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as staffService from './staffService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchStaffsSuccess,
} from './staffSlice';

function* fetchAllStaffs({ payload: branchId }) {
  try {
    yield put(operationStart());
    const staffs = yield call(staffService.fetchAllStaffs, branchId);
    yield put(fetchStaffsSuccess(staffs));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createStaff({ payload: staffData }) {
  try {
    yield put(operationStart());
    yield call(staffService.createStaff, staffData);
    yield call(fetchAllStaffs, staffData.branch_id);
    yield put(operationSuccess());
    toast.success("staff Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateStaff({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(staffService.updateStaff, id, data);
    yield put(operationSuccess());
    yield call(fetchAllStaffs, { payload: data.branch_id });
    toast.success("staff updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteStaff({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(staffService.deleteStaff, id);
    yield put(operationSuccess());
    NotificationManager.success('Staff deleted successfully', 'Success');
    yield call(fetchAllStaffs, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* staffSaga() {
  yield all([
    takeLatest('staffs/fetchAll', fetchAllStaffs),
    takeLatest('staffs/create', createStaff),
    takeLatest('staffs/update', updateStaff),
    takeLatest('staffs/delete', deleteStaff),
  ]);
}