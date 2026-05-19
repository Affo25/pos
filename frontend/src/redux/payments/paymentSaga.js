import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as paymentService from './paymentService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchPaymentsSuccess,
} from './paymentSlice';

function* fetchAllPayments({ payload: filters }) {
  try {
    yield put(operationStart());
    const payments = yield call(paymentService.fetchAllPayments, filters || {});
    yield put(fetchPaymentsSuccess(payments));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, { position: 'top-right', autoClose: 5000 });
  }
}

function* createPaymentSaga({ payload: paymentData }) {
  try {
    yield put(operationStart());
    yield call(paymentService.createPayment, paymentData);
    toast.success('Payment recorded successfully', {
      position: 'top-right',
      autoClose: 3000,
    });
    const payments = yield call(paymentService.fetchAllPayments, {});
    yield put(fetchPaymentsSuccess(payments));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, { position: 'top-right', autoClose: 5000 });
    throw error;
  }
}

function* cancelPaymentSaga({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(paymentService.cancelPayment, id);
    toast.success('Payment cancelled', { position: 'top-right', autoClose: 3000 });
    const payments = yield call(paymentService.fetchAllPayments, {});
    yield put(fetchPaymentsSuccess(payments));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, { position: 'top-right', autoClose: 5000 });
  }
}

export default function* paymentSaga() {
  yield all([
    takeLatest('payments/fetchAll', fetchAllPayments),
    takeLatest('payments/create', createPaymentSaga),
    takeLatest('payments/cancel', cancelPaymentSaga),
  ]);
}
