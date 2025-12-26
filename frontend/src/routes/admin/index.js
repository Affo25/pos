import { useSelector } from 'react-redux';
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import withAdminLayout from '../../layout/withAdminLayout';

const Events = lazy(() => import('../../container/Events/Events'));
const NonAcademics = lazy(() => import('../../container/NonAcademics/NonAcademics'));
const Newses = lazy(() => import('../../container/Newses/Newses'));
const Dashboard = lazy(() => import('../../container/dashboard'));
const Calendars = lazy(() => import('../../container/Calendar'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const Firebase = lazy(() => import('./firebase'));
const Teachers = lazy(() => import('../../container/Teachers/Teachers'));
const Users = lazy(() => import('../../container/Users/Users'));
const UserPages = lazy(() => import('../../container/pages/Pages'));
const PagesElement = lazy(() => import('../../container/pageElements/PageElement'));
const PageData = lazy(() => import('../../container/pageData/PageData'));
const Kirlas = lazy(() => import('../../container/Kirlas/Kirlas'));
const Profile = lazy(() => import('../../container/profile/myProfile/Profile'));
const BranchProfiles = lazy(() => import('../../container/BranchProfiles/BranchProfiles'));
const Faculties = lazy(() => import('../../container/Faculties/Faculties'));
const Departments = lazy(() => import('../../container/Departments/Departments'));
const Subjects = lazy(() => import('../../container/Subjects/Subjects'));
const Accountheads = lazy(() => import('../../container/AccountHeads/AccountHeads'));
const FeeHeads = lazy(() => import('../../container/FeeHeads/FeeHeads'));
const Clients = lazy(() => import('../../container/Clients/Clients'));
const Classtypes = lazy(() => import('../../container/ClassTypes/ClassTypes'));
const Guardians = lazy(() => import('../../container/Guardians/Guardians'));
const Staffs = lazy(() => import('../../container/Staffs/Staffs'));
const Students = lazy(() => import('../../container/Students/Students'));
const ClassLists = lazy(() => import('../../container/ClassLists/ClassLists'));
const StudentSetup = lazy(() => import('../../container/Students/CreateStudent'));
const ClasslistSetup = lazy(() => import('../../container/ClassLists/CreateClassList'));
const Accounts = lazy(() => import('../../container/Accounts/Accounts'));
const Transactions = lazy(() => import('../../container/Transactions/Transactions'));
const ClassAttendances = lazy(() => import('../../container/ClassAttendances/ClassAttendances'));
const FeeStructure = lazy(() => import('../../container/FeeStructures/FeeStructures'));
const FeeCollection = lazy(() => import('../../container/FeeCollections/FeeCollections'));
const TaskManagements = lazy(() => import('../../container/TaskManagements/TaskManagements'));
const Notices = lazy(() => import('../../container/Notices/Notices'));
const AttendanceStudent = lazy(() => import('../../container/Reports/AttendanceStudents'));

function Admin() {
  const { path } = useRouteMatch();
  const { login: user } = useSelector((state) => state.auth);
  console.log(user);

  if (!user) return null;

  const allowedPages = user.allowed_pages || [];

  const canAccess = (page) => {
    if (['superAdmin', 'admin', 'moderator'].includes(user.user_type)) {
      return true;
    }

    return allowedPages.includes(page);
  };
  return (
    <Switch>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        <Route exact path={`${path}`} component={Dashboard} />
        {canAccess('users') && <Route exact path={`${path}users`} component={Users} />}
        {canAccess('pages') && <Route exact path={`${path}pages`} component={UserPages} />}
        <Route exact path={`${path}page-settings/:pageId`} component={PagesElement} />
        <Route exact path={`${path}page-data/:pageId`} component={PageData} />
        {canAccess('calendar') && <Route path={`${path}calendar`} component={Calendars} />}
        {canAccess('firestore') && <Route path={`${path}firestore`} component={Firebase} />}
        {canAccess('profile') && <Route path={`${path}profile/myProfile`} component={Myprofile} />}
        {canAccess('teachers') && <Route exact path={`${path}teachers`} component={Teachers} />}
        {canAccess('kirlas') && <Route exact path={`${path}kirlas`} component={Kirlas} />}
        {canAccess('branchprofiles') && <Route exact path={`${path}branchprofiles`} component={BranchProfiles} />}
        {canAccess('faculties') && <Route exact path={`${path}faculties`} component={Faculties} />}
        {canAccess('departments') && <Route exact path={`${path}departments`} component={Departments} />}
        {canAccess('subjects') && <Route exact path={`${path}subjects`} component={Subjects} />}
        {canAccess('accountheads') && <Route exact path={`${path}accountheads`} component={Accountheads} />}
        {canAccess('feeheads') && <Route exact path={`${path}feeheads`} component={FeeHeads} />}
        {canAccess('clients') && <Route exact path={`${path}clients`} component={Clients} />}
        {canAccess('classtypes') && <Route exact path={`${path}classtypes`} component={Classtypes} />}
        {canAccess('guardians') && <Route exact path={`${path}guardians`} component={Guardians} />}
        {canAccess('staffs') && <Route exact path={`${path}staffs`} component={Staffs} />}
        {canAccess('students') && <Route exact path={`${path}students`} component={Students} />}
        {canAccess('classlists') && <Route exact path={`${path}classlists`} component={ClassLists} />}
        {canAccess('accounts') && <Route exact path={`${path}accounts`} component={Accounts} />}
        {canAccess('transactions') && <Route exact path={`${path}transactions`} component={Transactions} />}
        {canAccess('classattendances') && <Route exact path={`${path}classattendances`} component={ClassAttendances} />}
        {canAccess('feecollections') && <Route exact path={`${path}feecollections`} component={FeeCollection} />}
        <Route exact path={`${path}students/studentSetup`} component={StudentSetup} />
        <Route exact path={`${path}students/studentSetup/:id`} component={StudentSetup} />

        <Route exact path={`${path}classlists/classlistSetup`} component={ClasslistSetup} />
        <Route exact path={`${path}classlists/classlistsetup/:id`} component={ClasslistSetup} />
        {canAccess('feestructures') && <Route exact path={`${path}feestructures`} component={FeeStructure} />}
        {canAccess('taskmanagements') && <Route exact path={`${path}taskmanagements`} component={TaskManagements} />}

        <Route exact path={`${path}profile`} component={Profile} />
        {canAccess('notices') && <Route exact path={`${path}notices`} component={Notices} />}

        {canAccess('newses') && <Route exact path={`${path}news`} component={Newses} />}

        {canAccess('nonacademics') && <Route exact path={`${path}nonacademics`} component={NonAcademics} />}
        {canAccess('events') && <Route exact path={`${path}events`} component={Events} />}
        {canAccess('attendancestudents') && <Route exact path={`${path}attendancestudents`} component={AttendanceStudent} />}
      </Suspense>
    </Switch>
  );
}

export default withAdminLayout(Admin);
