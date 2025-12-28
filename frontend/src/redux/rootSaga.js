import { all } from 'redux-saga/effects';
import productSaga from './products/productSaga';

import facultieSaga from './faculties/facultiesSaga';
import branchprofileSaga from './branchprofiles/branchprofileSaga';
import userSaga from './users/userSaga';
import authSaga from './authentication/authSaga';

export default function* rootSaga() {
  yield all([

    userSaga(),
    authSaga(),
    branchprofileSaga(),
    facultieSaga(),
    productSaga(),
  ]);
}
