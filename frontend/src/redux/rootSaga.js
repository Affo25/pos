import { all } from 'redux-saga/effects';
import eventSaga from './events/eventSaga';
import nonacademicSaga from './nonacademics/nonacademicSaga';
import newseSaga from './newses/newseSaga';
import noticeSaga from './notices/noticeSaga';
import taskmanagementSaga from './taskmanagements/taskmanagementSaga';
import feecollectionSaga from './feecollections/feecollectionSaga';
import feestructureSaga from './feestructures/feestructureSaga';
import classattendanceSaga from './classattendances/classattendanceSaga';
import transactionSaga from './transactions/transactionSaga';
import accountSaga from './accounts/accountSaga';
import classListsaga from './classLists/classListSaga';
import studentSaga from './students/studentSaga';
import staffSaga from './staffs/staffSaga';
import guardianSaga from './guardians/guardianSaga';

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
    guardianSaga(),
    staffSaga(),
    studentSaga(),
    classListsaga(),
    accountSaga(),
    transactionSaga(),
    classattendanceSaga(),
    feestructureSaga(),
    feecollectionSaga(),
    taskmanagementSaga(),
    noticeSaga(),
    newseSaga(),
    nonacademicSaga(),
    eventSaga(),
]);
}
