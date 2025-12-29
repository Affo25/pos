import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
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
    toast.error(error.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }
}

function* createProduct({ payload: productData }) {
  try {
    yield put(operationStart());
    yield call(productService.createProduct, productData);
    toast.success('Product created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllProducts);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }
}

function* updateProduct({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(productService.updateProduct, id, data);
    yield put(operationSuccess());
    toast.success('Product updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllProducts);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }
}

function* deleteProduct({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(productService.deleteProduct, id);
    yield put(operationSuccess());
    toast.success('Product deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllProducts);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 3000,
    });
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