import { all, takeLatest, put, call } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import { toast } from 'react-toastify';
import * as branchprofileService from './branchprofileService';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchBranchProfilesSuccess,
} from './branchprofileSlice';

function* fetchAllBranchProfiles() {
  try {
    yield put(operationStart());
    const branchprofiles = yield call(branchprofileService.fetchAllBranchProfiles);
    yield put(fetchBranchProfilesSuccess(branchprofiles));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* createBranchProfile({ payload: branchprofileData }) {
  try {
    yield put(operationStart());
    yield call(branchprofileService.createBranchProfile, branchprofileData);
    
    yield call(fetchAllBranchProfiles);
    yield put(operationSuccess());
    toast.success("BranchProfile Created successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* updateBranchProfile({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(branchprofileService.updateBranchProfile, id, data);
    yield put(operationSuccess());
    yield call(fetchAllBranchProfiles,{ payload: data.branch_id });
    toast.success("BranchProfile Updated successfully 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

function* deleteBranchProfile({ payload: id }) {
  try {
    yield put(operationStart());
    yield call(branchprofileService.deleteBranchProfile, id);
    yield put(operationSuccess());
    NotificationManager.success('BranchProfile deleted successfully', 'Success');
    yield call(fetchAllBranchProfiles);
  } catch (error) {
    yield put(operationFailure(error.message));
    NotificationManager.error(error.message, 'Error');
  }
}

export default function* branchprofileSaga() {
  yield all([
    takeLatest('branchprofiles/fetchAll', fetchAllBranchProfiles),
    takeLatest('branchprofiles/create', createBranchProfile),
    takeLatest('branchprofiles/update', updateBranchProfile),
    takeLatest('branchprofiles/delete', deleteBranchProfile),
  ]);
}