import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as eventService from './eventService';
import { operationStart, operationSuccess, operationFailure, fetchEventsSuccess } from './eventSlice';

function* fetchAllEvents({ payload: branchId }) {
  try {
    yield put(operationStart());
    const events = yield call(eventService.fetchAllEvents, branchId);
    yield put(fetchEventsSuccess(events));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createEvent({ payload: eventData }) {
  try {
    console.log(eventData, 'e');

    yield put(operationStart());
    yield call(eventService.createEvent, eventData);
    yield call(fetchAllEvents, eventData.branch_id);
    yield put(operationSuccess());
    toast.success("Event Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateEvent({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(eventService.updateEvent, id, data);
    yield put(operationSuccess());
    yield call(fetchAllEvents, { payload: data.branch_id });
    toast.success("Event updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteEvent({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(eventService.deleteEvent, id);
    yield put(operationSuccess());
    NotificationManager.success('Event deleted successfully', 'Success');
    yield call(fetchAllEvents, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* eventSaga() {
  yield all([
    takeLatest('events/fetchAll', fetchAllEvents),
    takeLatest('events/create', createEvent),
    takeLatest('events/update', updateEvent),
    takeLatest('events/delete', deleteEvent),
  ]);
}
