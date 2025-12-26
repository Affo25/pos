import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as taskmanagementService from './taskmanagementService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTaskManagementsSuccess,
} from './taskmanagementSlice';

function* fetchAllTaskManagements({ payload: branchId }) {
  try {
    yield put(operationStart());
    const taskmanagements = yield call(taskmanagementService.fetchAllTaskManagements, branchId);
    yield put(fetchTaskManagementsSuccess(taskmanagements));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createTaskManagement({ payload: taskmanagementData }) {
  try {
    yield put(operationStart());
    yield call(taskmanagementService.createTaskManagement, taskmanagementData);
    yield call(fetchAllTaskManagements, taskmanagementData.branch_id);
    yield put(operationSuccess());
toast.success("TaskManagement Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateTaskManagement({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(taskmanagementService.updateTaskManagement, id, data);
    yield put(operationSuccess());
    yield call(fetchAllTaskManagements, { payload: data.branch_id });
    toast.success("TaskManagement updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteTaskManagement({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(taskmanagementService.deleteTaskManagement, id);
    yield put(operationSuccess());
    NotificationManager.success('TaskManagement deleted successfully', 'Success');
    yield call(fetchAllTaskManagements, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* taskmanagementSaga() {
  yield all([
    takeLatest('taskmanagements/fetchAll', fetchAllTaskManagements),
    takeLatest('taskmanagements/create', createTaskManagement),
    takeLatest('taskmanagements/update', updateTaskManagement),
    takeLatest('taskmanagements/delete', deleteTaskManagement),
  ]);
}