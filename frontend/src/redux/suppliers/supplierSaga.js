import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as supplierService from './supplierService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSuppliersSuccess,
} from './supplierSlice';

function* fetchAllSuppliers() {
  try {
    yield put(operationStart());
    const suppliers = yield call(supplierService.fetchAllSuppliers);
    yield put(fetchSuppliersSuccess(suppliers));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createSupplier({ payload: supplierData }) {
  try {
    yield put(operationStart());
    yield call(supplierService.createSupplier, supplierData);
     toast.success('Supplier created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSuppliers);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateSupplier({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(supplierService.updateSupplier, id, data);
    yield put(operationSuccess());
     toast.success('Supplier updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSuppliers);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* deleteSupplier({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(supplierService.deleteSupplier, id);
    yield put(operationSuccess());
    toast.success('Supplier deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSuppliers);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* supplierSaga() {
  yield all([
    takeLatest('suppliers/fetchAll', fetchAllSuppliers),
    takeLatest('suppliers/create', createSupplier),
    takeLatest('suppliers/update', updateSupplier),
    takeLatest('suppliers/delete', deleteSupplier),
  ]);
}