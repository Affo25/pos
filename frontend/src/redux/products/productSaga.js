import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as productService from './productService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchProductsSuccess,
} from './productSlice';

function* fetchAllProducts() {
  try {
    yield put(operationStart());
    const products = yield call(productService.fetchAllProducts);
    yield put(fetchProductsSuccess(products));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createProduct({ payload: productData }) {
  try {
    yield put(operationStart());
    yield call(productService.createProduct, productData);
    NotificationManager.success('Product created successfully', 'Success');
    yield call(fetchAllProducts);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateProduct({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(productService.updateProduct, id, data);
    yield put(operationSuccess());
    NotificationManager.success('Product updated successfully', 'Success');
    yield call(fetchAllProducts);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteProduct({ payload: { id } }) {
  try {
    yield put(operationStart());
    yield call(productService.deleteProduct, id);
    yield put(operationSuccess());
    NotificationManager.success('Product deleted successfully', 'Success');
    yield call(fetchAllProducts);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* productSaga() {
  yield all([
    takeLatest('products/fetchAll', fetchAllProducts),
    takeLatest('products/create', createProduct),
    takeLatest('products/update', updateProduct),
    takeLatest('products/delete', deleteProduct),
  ]);
}