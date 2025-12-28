import { useSelector } from 'react-redux';
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import withAdminLayout from '../../layout/withAdminLayout';

const Dashboard = lazy(() => import('../../container/dashboard'));
const Calendars = lazy(() => import('../../container/Calendar'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const Firebase = lazy(() => import('./firebase'));
const Users = lazy(() => import('../../container/Users/Users'));
const Profile = lazy(() => import('../../container/profile/myProfile/Profile'));
const BranchProfiles = lazy(() => import('../../container/BranchProfiles/BranchProfiles'));
const Faculties = lazy(() => import('../../container/Faculties/Faculties'));

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
        {canAccess('calendar') && <Route path={`${path}calendar`} component={Calendars} />}
        {canAccess('firestore') && <Route path={`${path}firestore`} component={Firebase} />}
        {canAccess('profile') && <Route path={`${path}profile/myProfile`} component={Myprofile} />}
        {canAccess('branchprofiles') && <Route exact path={`${path}branchprofiles`} component={BranchProfiles} />}
        {canAccess('faculties') && <Route exact path={`${path}faculties`} component={Faculties} />}
        <Route exact path={`${path}profile`} component={Profile} />
      </Suspense>
    </Switch>
  );
}

export default withAdminLayout(Admin);
