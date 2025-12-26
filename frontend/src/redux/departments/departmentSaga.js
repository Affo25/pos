import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as departmentService from './departmentService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchDepartmentsSuccess,
} from './departmentSlice';

function* fetchAllDepartments({ payload: branchId }) {
  try {
    yield put(operationStart());
    const departments = yield call(departmentService.fetchAllDepartments, branchId);
    yield put(fetchDepartmentsSuccess(departments));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createDepartment({ payload: departmentData }) {
  try {
    yield put(operationStart());
    yield call(departmentService.createDepartment, departmentData);
   
    yield call(fetchAllDepartments, { payload: departmentData.branch_id });
    yield put(operationSuccess());
    toast.success("Department Created successfully 🎉", {
          position: "top-right",
          autoClose: 3000,
        });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateDepartment({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(departmentService.updateDepartment, id, data);
    yield put(operationSuccess());
    yield call(fetchAllDepartments, { payload: data.branch_id });
    toast.success("Department updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteDepartment({ payload: {id, branchId} }) {
  try {
    yield put(operationStart());
    yield call(departmentService.deleteDepartment, id);
    yield put(operationSuccess());
    NotificationManager.success('Department deleted successfully', 'Success');
    yield call(fetchAllDepartments, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* departmentSaga() {
  yield all([
    takeLatest('departments/fetchAll', fetchAllDepartments),
    takeLatest('departments/create', createDepartment),
    takeLatest('departments/update', updateDepartment),
    takeLatest('departments/delete', deleteDepartment),
  ]);
}