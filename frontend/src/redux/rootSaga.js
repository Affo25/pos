import { all } from 'redux-saga/effects';
import supplierSaga from './suppliers/supplierSaga';
import purchaseorderSaga from './purchaseorders/purchaseorderSaga';
import saleSaga from './sales/saleSaga';
import customerSaga from './customers/customerSaga';
import subcategorySaga from './subcategorys/subcategorySaga';
import categorySaga from './categorys/categorySaga';
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
    categorySaga(),
    subcategorySaga(),
    customerSaga(),
    saleSaga(),
    supplierSaga(),
    purchaseorderSaga(),
  ]);
}
