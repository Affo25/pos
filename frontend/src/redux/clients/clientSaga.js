import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import * as clientService from './clientService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClientsSuccess,
} from './clientSlice';

function* fetchAllClients() {
  try {
    yield put(operationStart());
    const clients = yield call(clientService.fetchAllClients);
    yield put(fetchClientsSuccess(clients));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createClient({ payload: clientData, meta }) {
  try {
    yield put(operationStart());
    const created = yield call(clientService.createClient, clientData);
    NotificationManager.success('Client created successfully', 'Success');
    yield call(fetchAllClients);
    yield put(operationSuccess());

    if (meta?.resolve) meta.resolve(created);
  } catch (error) {
    yield put(operationFailure(error.message));
    if (meta?.reject) meta.reject(error);
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateClient({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(clientService.updateClient, id, data);
    yield put(operationSuccess());
    NotificationManager.success('Client updated successfully', 'Success');
    yield call(fetchAllClients);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteClient({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(clientService.deleteClient, id);
    yield put(operationSuccess());
    NotificationManager.success('Client deleted successfully', 'Success');
    yield call(fetchAllClients);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* clientSaga() {
  yield all([
    takeLatest('clients/fetchAll', fetchAllClients),
    takeLatest('clients/create', createClient),
    takeLatest('clients/update', updateClient),
    takeLatest('clients/delete', deleteClient),
  ]);
}