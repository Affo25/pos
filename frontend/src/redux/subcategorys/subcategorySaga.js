import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as subcategoryService from './subcategoryService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSubCategorysSuccess,
} from './subcategorySlice';

function* fetchAllSubCategorys() {
  try {
    yield put(operationStart());
    const subcategorys = yield call(subcategoryService.fetchAllSubCategorys);
    yield put(fetchSubCategorysSuccess(subcategorys));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createSubCategory({ payload: subcategoryData }) {
  try {
    yield put(operationStart());
    yield call(subcategoryService.createSubCategory, subcategoryData);
     toast.success('SubCategory created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSubCategorys);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateSubCategory({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(subcategoryService.updateSubCategory, id, data);
    yield put(operationSuccess());
     toast.success('SubCategory updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSubCategorys);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* deleteSubCategory({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(subcategoryService.deleteSubCategory, id);
    yield put(operationSuccess());
    toast.success('SubCategory deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSubCategorys);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* subcategorySaga() {
  yield all([
    takeLatest('subcategorys/fetchAll', fetchAllSubCategorys),
    takeLatest('subcategorys/create', createSubCategory),
    takeLatest('subcategorys/update', updateSubCategory),
    takeLatest('subcategorys/delete', deleteSubCategory),
  ]);
}