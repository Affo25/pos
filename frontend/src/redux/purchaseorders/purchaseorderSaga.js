import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as purchaseorderService from './purchaseorderService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPurchaseOrdersSuccess,
} from './purchaseorderSlice';

function* fetchAllPurchaseOrders() {
  try {
    yield put(operationStart());
    const purchaseorders = yield call(purchaseorderService.fetchAllPurchaseOrders);
    yield put(fetchPurchaseOrdersSuccess(purchaseorders));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createPurchaseOrder({ payload: purchaseorderData }) {
  try {
    yield put(operationStart());
    yield call(purchaseorderService.createPurchaseOrder, purchaseorderData);
     toast.success('PurchaseOrder created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllPurchaseOrders);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updatePurchaseOrder({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(purchaseorderService.updatePurchaseOrder, id, data);
    yield put(operationSuccess());
     toast.success('PurchaseOrder updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllPurchaseOrders);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* deletePurchaseOrder({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(purchaseorderService.deletePurchaseOrder, id);
    yield put(operationSuccess());
    toast.success('PurchaseOrder deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllPurchaseOrders);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* purchaseorderSaga() {
  yield all([
    takeLatest('purchaseorders/fetchAll', fetchAllPurchaseOrders),
    takeLatest('purchaseorders/create', createPurchaseOrder),
    takeLatest('purchaseorders/update', updatePurchaseOrder),
    takeLatest('purchaseorders/delete', deletePurchaseOrder),
  ]);
}