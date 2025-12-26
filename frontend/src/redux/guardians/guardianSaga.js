import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { NotificationManager } from 'react-notifications';
import * as guardianService from './guardianService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchGuardiansSuccess,
} from './guardianSlice';

function* fetchAllGuardians({ payload: branchId }) {
  try {
    yield put(operationStart());
    const guardians = yield call(guardianService.fetchAllGuardians, branchId);
    yield put(fetchGuardiansSuccess(guardians));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createGuardian({ payload: guardianData }) {
  try {
    yield put(operationStart());
    yield call(guardianService.createGuardian, guardianData);
 toast.success("Guardian Created successfully 🎉", {
       position: "top-right",
       autoClose: 3000,
     });
    yield call(fetchAllGuardians, guardianData.branch_id);
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateGuardian({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(guardianService.updateGuardian, id, data);
    yield put(operationSuccess());
    yield call(fetchAllGuardians, { payload: data.branch_id });
    toast.success("Guardian updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteGuardian({ payload: { id, branchId } }) {
  try {
    yield put(operationStart());
    yield call(guardianService.deleteGuardian, id);
    yield put(operationSuccess());
    NotificationManager.success('Guardian deleted successfully', 'Success');
    yield call(fetchAllGuardians, { payload: branchId });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* guardianSaga() {
  yield all([
    takeLatest('guardians/fetchAll', fetchAllGuardians),
    takeLatest('guardians/create', createGuardian),
    takeLatest('guardians/update', updateGuardian),
    takeLatest('guardians/delete', deleteGuardian),
  ]);
}


// /* eslint-disable-next-line no-use-before-define */
// import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
// import { NotificationManager } from 'react-notifications';
// import {
//   setIsLoading,
//   getGuardians,
//   setGuardians,
//   createGuardian,
//   updateGuardian,
//   deleteGuardian,
// } from './guardianSlice';
// import guardianService from './guardianService';

// function* handleGetGuardians(input) {
//   try {
//     yield put(setIsLoading(true));
//     const response = yield call(guardianService.getGuardians, input.payload);
//     yield put(setGuardians(response.data));
//     console.log("API response in saga:", response);
//     yield put(setIsLoading(false));
//   } catch (e) {
//     console.log(e.message);
//     NotificationManager.error(e.message, 'Error');
//     yield put(setIsLoading(false));
//   }
// }

// function* handleCreateGuardian(input) {
//   try {
//     yield put(setIsLoading(true));
//     yield call(guardianService.createGuardian, input.payload);
//     NotificationManager.success('Guardian created successfully', 'Success');
//     yield put(getGuardians());
//     yield put(setIsLoading(false));
//   } catch (e) {
//     console.log(e.message);
//     NotificationManager.error(e.message, 'Error');
//     yield put(setIsLoading(false));
//   }
// }

// function* handleUpdateGuardian(input) {
//   try {
//     yield put(setIsLoading(true));
//     yield call(guardianService.updateGuardian, input.payload);
//     NotificationManager.success('Guardian updated successfully', 'Success');
//     yield put(getGuardians());
//     yield put(setIsLoading(false));
//   } catch (e) {
//     console.log(e.message);
//     NotificationManager.error(e.message, 'Error');
//     yield put(setIsLoading(false));
//   }
// }

// function* handleDeleteGuardian(input) {
//   try {
//     yield put(setIsLoading(true));
//     yield call(guardianService.deleteGuardian, input.payload);
//     NotificationManager.success('Guardian deleted successfully', 'Success');
//     yield put(getGuardians());
//     yield put(setIsLoading(false));
//   } catch (e) {
//     console.log(e.message);
//     NotificationManager.error(e.message, 'Error');
//     yield put(setIsLoading(false));
//   }
// }

// export function* watchGetGuardians() {
//   yield takeLatest(getGuardians.type, handleGetGuardians);
// }

// export function* watchCreateGuardian() {
//   yield takeLatest(createGuardian.type, handleCreateGuardian);
// }

// export function* watchUpdateGuardian() {
//   yield takeLatest(updateGuardian.type, handleUpdateGuardian);
// }

// export function* watchDeleteGuardian() {
//   yield takeLatest(deleteGuardian.type, handleDeleteGuardian);
// }

// export default function* rootSaga() {
//   yield all([
//     fork(watchGetGuardians),
//     fork(watchCreateGuardian),
//     fork(watchUpdateGuardian),
//     fork(watchDeleteGuardian),
//   ]);
// }
