import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as customerService from './customerService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchCustomersSuccess,
} from './customerSlice';

function* fetchAllCustomers() {
  try {
    yield put(operationStart());
    const customers = yield call(customerService.fetchAllCustomers);
    yield put(fetchCustomersSuccess(customers));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* createCustomer({ payload: customerData }) {
  try {
    yield put(operationStart());
    yield call(customerService.createCustomer, customerData);
     toast.success('Customer created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCustomers);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateCustomer({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(customerService.updateCustomer, id, data);
    yield put(operationSuccess());
     toast.success('Customer updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCustomers);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* deleteCustomer({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(customerService.deleteCustomer, id);
    yield put(operationSuccess());
    toast.success('Customer deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAllCustomers);
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* customerSaga() {
  yield all([
    takeLatest('customers/fetchAll', fetchAllCustomers),
    takeLatest('customers/create', createCustomer),
    takeLatest('customers/update', updateCustomer),
    takeLatest('customers/delete', deleteCustomer),
  ]);
}