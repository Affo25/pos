import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as saleService from './saleService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSalesSuccess,
} from './saleSlice';

function* fetchAllSales() {
  try {
    yield put(operationStart());
    const sales = yield call(saleService.fetchAllSales);
    yield put(fetchSalesSuccess(sales));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createSale({ payload: saleData }) {
  try {
    yield put(operationStart());
    yield call(saleService.createSale, saleData);
     toast.success('Sale created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSales);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateSale({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(saleService.updateSale, id, data);
    yield put(operationSuccess());
     toast.success('Sale updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSales);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* processReturn({ payload: returnData }) {
  try {
    yield put(operationStart());
    yield call(saleService.processReturn, returnData);
    yield put(operationSuccess());
    toast.success('Return processed successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSales);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* deleteSale({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(saleService.deleteSale, id);
    yield put(operationSuccess());
    toast.success('Sale deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllSales);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* saleSaga() {
  yield all([
    takeLatest('sales/fetchAll', fetchAllSales),
    takeLatest('sales/create', createSale),
    takeLatest('sales/update', updateSale),
    takeLatest('sales/delete', deleteSale),
    takeLatest('sales/processReturn', processReturn),
  ]);
}