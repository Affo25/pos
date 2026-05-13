import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as productService from './productService';

import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchProductsSuccess,
  fetchCategoriesSuccess,
  fetchSuppliersSuccess,
} from './productSlice';

// ================= PRODUCTS =================
function* fetchAllProducts() {
  try {
    yield put(operationStart());
    const products = yield call(productService.fetchAllProducts);
    yield put(fetchProductsSuccess(products));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= CATEGORIES =================
function* fetchAllCategories() {
  try {
    yield put(operationStart());
    const categories = yield call(productService.fetchAllCategories);
    yield put(fetchCategoriesSuccess(categories));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= SUPPLIERS =================
function* fetchAllSuppliers() {
  try {
    yield put(operationStart());
    const suppliers = yield call(productService.fetchAllSuppliers);
    yield put(fetchSuppliersSuccess(suppliers));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= CREATE =================
function* createProduct({ payload }) {
  try {
    yield put(operationStart());
    yield call(productService.createProduct, payload);
    toast.success('Product created successfully');
    yield call(fetchAllProducts);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= UPDATE =================
function* updateProduct({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(productService.updateProduct, { id, data });
    toast.success('Product updated successfully');
    yield call(fetchAllProducts);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= DELETE =================
function* deleteProduct({ payload }) {
  try {
    yield put(operationStart());
    yield call(productService.deleteProduct, payload);
    toast.success('Product deleted successfully');
    yield call(fetchAllProducts);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= ROOT =================
export default function* productSaga() {
  yield all([
    takeLatest('products/fetchAll', fetchAllProducts),
    takeLatest('products/fetchCategories', fetchAllCategories),
    takeLatest('products/fetchSuppliers', fetchAllSuppliers),
    takeLatest('products/create', createProduct),
    takeLatest('products/update', updateProduct),
    takeLatest('products/delete', deleteProduct),
  ]);
}