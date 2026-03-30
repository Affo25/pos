import { useSelector } from 'react-redux';
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import withAdminLayout from '../../layout/withAdminLayout';

const PurchaseOrders = lazy(() => import('../../container/PurchaseOrders/PurchaseOrders'));
const Suppliers = lazy(() => import('../../container/Suppliers/Suppliers'));
const Sales = lazy(() => import('../../container/Sales/Sales'));
const POSBilling = lazy(() => import('../../container/POSBilling/POSBilling'));
const StockManagement = lazy(() => import('../../container/StockManagement/StockManagement'));
const Customers = lazy(() => import('../../container/Customers/Customers'));
const SubCategorys = lazy(() => import('../../container/SubCategorys/SubCategorys'));
const Categorys = lazy(() => import('../../container/Categorys/Categorys'));
const Products = lazy(() => import('../../container/Products/Products'));
const Dashboard = lazy(() => import('../../container/dashboard'));
const Calendars = lazy(() => import('../../container/Calendar'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const Firebase = lazy(() => import('./firebase'));
const Users = lazy(() => import('../../container/Users/Users'));
const UserDetails = lazy(() => import('../../container/Users/UserDetails'));
const Profile = lazy(() => import('../../container/profile/myProfile/Profile'));
const BranchProfiles = lazy(() => import('../../container/BranchProfiles/BranchProfiles'));
const Faculties = lazy(() => import('../../container/Faculties/Faculties'));

function Admin() {
  const { path } = useRouteMatch();
  const { login: user } = useSelector((state) => state.auth);

  if (!user) return null;

  const allowedPages = user.allowed_pages || [];

  const canAccess = (page) => {
    if (['superAdmin', 'admin'].includes(user.user_type)) {
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
        {canAccess('users') && <Route exact path={`${path}users/:id`} component={UserDetails} />}
        {canAccess('calendar') && <Route path={`${path}calendar`} component={Calendars} />}
        {canAccess('firestore') && <Route path={`${path}firestore`} component={Firebase} />}
        {canAccess('profile') && <Route path={`${path}profile/myProfile`} component={Myprofile} />}
        {canAccess('branchprofiles') && <Route exact path={`${path}branchprofiles`} component={BranchProfiles} />}
        {canAccess('faculties') && <Route exact path={`${path}faculties`} component={Faculties} />}
        {canAccess('products') && <Route exact path={`${path}products`} component={Products} />}
        <Route exact path={`${path}profile`} component={Profile} />
        {canAccess('categorys') && <Route exact path={`${path}categorys`} component={Categorys} />}
        {canAccess('subcategorys') && <Route exact path={`${path}subcategorys`} component={SubCategorys} />}
        {canAccess('customers') && <Route exact path={`${path}customers`} component={Customers} />}
        {canAccess('sales') && <Route exact path={`${path}sales`} component={Sales} />}
        {canAccess('sales') && <Route exact path={`${path}pos-billing`} component={POSBilling} />}
        {canAccess('products') && <Route exact path={`${path}stock-management`} component={StockManagement} />}
        {canAccess('suppliers') && <Route exact path={`${path}suppliers`} component={Suppliers} />}
        {canAccess('purchaseorders') && <Route exact path={`${path}purchaseorders`} component={PurchaseOrders} />}</Suspense>
    </Switch>
  );
}

export default withAdminLayout(Admin);
