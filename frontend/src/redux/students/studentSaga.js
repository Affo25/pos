import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { NotificationManager } from 'react-notifications';
import * as studentService from './studentService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchStudentsSuccess,
} from './studentSlice';

function* fetchAllStudents({ payload: branchId }) {
  try {
    yield put(operationStart());
    const students = yield call(studentService.fetchAllStudents, branchId);
    yield put(fetchStudentsSuccess(students));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

// function* handleCreateStudent({ payload: studentData }) {
//   console.log('[SAGA] handleCreateStudent START with:', studentData);
//   try {
//     yield put(operationStart());
//     const response = yield call(studentService.createStudent, studentData);
//     console.log('[SAGA] studentService.createStudent RESPONSE:', response);
//     NotificationManager.success('Student created successfully', 'Success');
//     console.log('[SAGA] Fetching updated students list for branch:', studentData.branch_id);
//     yield call(fetchAllStudents, { payload: studentData.branch_id });
//     yield put(operationSuccess());
//   } catch (error) {
//     yield put(operationFailure(error.message));
//     NotificationManager.error(error.message, 'Error');
//   }
// }

function* handleCreateStudent({ payload: studentData }) {
  try {
    yield put(operationStart());
    yield call(studentService.createStudent, studentData);
    
    if (studentData?.branch_id) {
      console.log('[SAGA] Dispatching students/fetchAll for branch:', studentData.branch_id);
      yield put({ type: 'students/fetchAll', payload: studentData.branch_id });
    }
    
    yield put(operationSuccess());
toast.success("Student Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message || String(error)));
    NotificationManager.error(error.message || 'Error');
  }
}
function* handleUpdateStudent({ payload: { id, data } }) {
  try {
    console.log(data, 'dds');
    yield put(operationStart());
    yield call(studentService.updateStudent, id, data);
    yield put(operationSuccess());
    yield call(fetchAllStudents, { payload: data.branch_id });
    toast.success("Student updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* handleDeleteStudent({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(studentService.deleteStudent, id);
    yield put(operationSuccess());
    NotificationManager.success('Student deleted successfully', 'Success');
    yield call(fetchAllStudents, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* studentSaga() {
  yield all([
    takeLatest('students/fetchAll', fetchAllStudents),
    takeLatest('students/create', handleCreateStudent),
    takeLatest('students/update', handleUpdateStudent),
    takeLatest('students/delete', handleDeleteStudent),
  ]);
}