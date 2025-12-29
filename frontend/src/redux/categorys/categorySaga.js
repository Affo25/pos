import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as categoryService from './categoryService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchCategorysSuccess,
} from './categorySlice';

function* fetchAllCategorys() {
  try {
    yield put(operationStart());
    const categorys = yield call(categoryService.fetchAllCategorys);
    yield put(fetchCategorysSuccess(categorys));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createCategory({ payload: categoryData }) {
  try {
    yield put(operationStart());
    yield call(categoryService.createCategory, categoryData);
     toast.success('Category created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCategorys);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateCategory({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(categoryService.updateCategory, id, data);
    yield put(operationSuccess());
     toast.success('Category updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCategorys);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* deleteCategory({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(categoryService.deleteCategory, id);
    yield put(operationSuccess());
    toast.success('Category deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCategorys);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* categorySaga() {
  yield all([
    takeLatest('categorys/fetchAll', fetchAllCategorys),
    takeLatest('categorys/create', createCategory),
    takeLatest('categorys/update', updateCategory),
    takeLatest('categorys/delete', deleteCategory),
  ]);
}