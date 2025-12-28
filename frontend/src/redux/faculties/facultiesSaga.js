import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as facultieservice from './facultiesService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchFacultiesuccess,
} from './facultiesSlice';

function* fetchAllFaculties() {
  try {
    yield put(operationStart());
    const faculties = yield call(facultieservice.fetchAllFaculties);
    yield put(fetchFacultiesuccess(faculties));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }
}

function* createFaculties(facultiesData) {
  try {
    yield put(operationStart());
    yield call(facultieservice.createFaculties, facultiesData);
    yield call(fetchAllFaculties, { facultiesData });
    yield put(operationSuccess());
    toast.success("Faculties Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}


function* updateFaculties({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(facultieservice.updateFaculties, id, data);
    yield put(operationSuccess());
    yield call(fetchAllFaculties);
    toast.success("Faculties Updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteFaculties({ payload: { id } }) {
  try {
    yield put(operationStart());
    yield call(facultieservice.deleteFaculties, id);
    yield put(operationSuccess());
    NotificationManager.success('Faculties deleted successfully', 'Success');
    yield call(fetchAllFaculties);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}


export default function* facultiesaga() {
  yield all([
    takeLatest('faculties/fetchAll', fetchAllFaculties),
    takeLatest('faculties/create', createFaculties),
    takeLatest('faculties/update', updateFaculties),
    takeLatest('faculties/delete', deleteFaculties),
  ]);
}
