import { all } from 'redux-saga/effects';
import eventSaga from './events/eventSaga';
import nonacademicSaga from './nonacademics/nonacademicSaga';
import newseSaga from './newses/newseSaga';
import noticeSaga from './notices/noticeSaga';

import classtypeSaga from './classtypes/classtypeSaga';
import clientSaga from './clients/clientSaga';
import feeHeadsaga from './feeheads/feeheadsSaga';
import accountheadsaga from './accountheads/accountheadsSaga';
import subjectsaga from './subjects/subjectsSaga';
import departmentSaga from './departments/departmentSaga';
import facultiesaga from './faculties/facultiesSaga';
import branchprofileSaga from './branchprofiles/branchprofileSaga';
import kirlaSaga from './kirlas/kirlaSaga';
import userSaga from './users/userSaga';
import teacherSaga from './teachers/teacherSaga';
import pageSaga from './pages/pageSaga';
import pageElementSaga from './pageElements/pageElementSaga';
import authSaga from './authentication/authSaga';

export default function* rootSaga() {
  yield all([




    pageSaga(),
    pageElementSaga(),
    teacherSaga(),
    userSaga(),
    kirlaSaga(),
    authSaga(),
    branchprofileSaga(),
    facultiesaga(),
    departmentSaga(),
    subjectsaga(),
    accountheadsaga(),
    feeHeadsaga(),
    clientSaga(),
    classtypeSaga(),
    noticeSaga(),
    newseSaga(),
    nonacademicSaga(),
    eventSaga(),
  ]);
}
