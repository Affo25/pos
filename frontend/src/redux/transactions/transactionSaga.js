import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as transactionService from './transactionService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTransactionsSuccess,
} from './transactionSlice';

function* fetchAllTransactions({ payload: branchId }) {
  try {
    yield put(operationStart());
    const transactions = yield call(transactionService.fetchAllTransactions, branchId);
    yield put(fetchTransactionsSuccess(transactions));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createTransaction({ payload: transactionData }) {
  try {
    yield put(operationStart());
    yield call(transactionService.createTransaction, transactionData);
    yield call(fetchAllTransactions, transactionData.branch_id);
    yield put(operationSuccess());
toast.success("Transaction Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateTransaction({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(transactionService.updateTransaction, id, data);
    yield put(operationSuccess());
    yield call(fetchAllTransactions, { payload: data.branch_id });
    toast.success("Transaction updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteTransaction({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(transactionService.deleteTransaction, id);
    yield put(operationSuccess());
    NotificationManager.success('Transaction deleted successfully', 'Success');
    yield call(fetchAllTransactions, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* transactionSaga() {
  yield all([
    takeLatest('transactions/fetchAll', fetchAllTransactions),
    takeLatest('transactions/create', createTransaction),
    takeLatest('transactions/update', updateTransaction),
    takeLatest('transactions/delete', deleteTransaction),
  ]);
}