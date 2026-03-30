/* eslint-disable no-underscore-dangle */
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { Menu } from 'antd';
import { NavLink, useRouteMatch, useLocation } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';
import { fetchAllBranchProfiles } from '../redux/branchprofiles/branchprofileSlice';
import { setSelectedBranch } from '../redux/selectedBranch/selectedBranchSlice';

function MenuItems({ darkMode, toggleCollapsed, topMenu }) {
  const { path } = useRouteMatch();
  const dispatch = useDispatch();
  const { branchprofiles } = useSelector((state) => state.branchprofiles);
  const selectedBranchId = useSelector((state) => state.seletedBranch.selectedBranchId);
  const location = useLocation();
  const pathSegments = location.pathname.replace(path, '').split('/').filter(Boolean);

  const { login: user } = useSelector((state) => state.auth);
  const allowedPages = user?.allowed_pages || [];

  const canAccess = (page) => {
    if (!user) return false;

    if (['superAdmin', 'admin'].includes(user.user_type)) {
      return true;
    }

    return allowedPages.includes(page);
  };

  const [openKeys, setOpenKeys] = React.useState(!topMenu ? [pathSegments[0] || 'dashboard'] : []);

  const onOpenChange = (keys) => {
    const latestKey = keys[keys.length - 1];
    setOpenKeys(latestKey !== 'recharts' ? [latestKey] : keys);
  };

  const onClick = (item) => {
    if (item.keyPath.length === 1) setOpenKeys([]);
  };

  const getSelectedKey = () => {
    if (pathSegments.length === 0) return ['home'];

    const page = pathSegments[0].toLowerCase();

    const menuKeys = {
      users: 'Users',
      pages: 'Pages',
      faculties: 'Faculties',
      products: 'Products',
      categorys: 'Categorys',
      subCategorys: 'SubCategorys',
      customers: 'Customers',
      sales: 'Sales',
      'pos-billing': 'POSBilling',
      'stock-management': 'StockManagement',
      suppliers: 'Suppliers',
      purchaseOrders: 'PurchaseOrders',
    };

    return menuKeys[page] ? [menuKeys[page]] : [];
  };

  const selectedKey = !topMenu ? getSelectedKey() : [];

  useEffect(() => {
    dispatch(fetchAllBranchProfiles());
  }, []);

  useEffect(() => {
    if (branchprofiles.length > 0) {
      const firstBranchId = selectedBranchId || branchprofiles[0]._id;
      dispatch(setSelectedBranch(firstBranchId));
    }
  }, [branchprofiles, selectedBranchId]);

  return (
    <>
      <Menu
        mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
        theme={darkMode ? 'dark' : 'light'}
        onOpenChange={onOpenChange}
        onClick={onClick}
        selectedKeys={selectedKey}
        defaultOpenKeys={!topMenu ? [pathSegments[0] || 'dashboard'] : []}
        overflowedIndicator={<FeatherIcon icon="more-vertical" />}
        openKeys={openKeys}
      >
        <Menu.Item key="home" icon={!topMenu && <FeatherIcon icon="home" />}>
          <NavLink onClick={toggleCollapsed} to={`${path}`}>
            Dashboard
          </NavLink>
        </Menu.Item>
        <Menu.SubMenu key="Setup" title="Setup" icon={!topMenu && <FeatherIcon icon="layers" />}>
          {canAccess('branchprofiles') && (
            <Menu.Item key="BranchProfiles">
              <NavLink onClick={toggleCollapsed} to={`${path}branchprofiles`}>
                Branch Profiles
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('faculties') && (
            <Menu.Item key="Faculties">
              <NavLink onClick={toggleCollapsed} to={`${path}faculties`}>
                Faculties
              </NavLink>
            </Menu.Item>
          )}
           {canAccess('categorys') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="layers" />} key="Categorys">
            <NavLink onClick={toggleCollapsed} to={`${path}categorys`}>
              Categories
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('subcategorys') && (
          <Menu.Item  icon={!topMenu && <FeatherIcon icon="layers" />} key="SubCategorys">
            <NavLink onClick={toggleCollapsed} to={`${path}subcategorys`}>
              SubCategories
            </NavLink>
          </Menu.Item>
        )}
        </Menu.SubMenu>

        {canAccess('products') && (
          <Menu.Item icon={<FeatherIcon icon="package" />} key="Products">
            <NavLink onClick={toggleCollapsed} to={`${path}products`}>
              Products
            </NavLink>
          </Menu.Item>
        )}
       
        {canAccess('customers') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="user-check" />}  key="Customers">
            <NavLink onClick={toggleCollapsed} to={`${path}customers`}>
              Customers
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('sales') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="user-check" />}  key="Sales">
            <NavLink onClick={toggleCollapsed} to={`${path}sales`}>
              Sales
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('sales') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="credit-card" />} key="POSBilling">
            <NavLink onClick={toggleCollapsed} to={`${path}pos-billing`}>
              POS Billing
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('products') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="archive" />} key="StockManagement">
            <NavLink onClick={toggleCollapsed} to={`${path}stock-management`}>
              Stock Management
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('purchaseorders') && (
          <Menu.Item icon={!topMenu && <FeatherIcon icon="user-check" />} key="PurchaseOrders">
            <NavLink onClick={toggleCollapsed} to={`${path}purchaseorders`}>
              PurchaseOrders
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('suppliers') && (
          <Menu.Item icon={<FeatherIcon icon="truck" />} key="Suppliers">
            <NavLink onClick={toggleCollapsed} to={`${path}suppliers`}>
              Suppliers
            </NavLink>
          </Menu.Item>

        )}
        {canAccess('users') && (
          <Menu.Item key="Users" icon={!topMenu && <FeatherIcon icon="user-check" />}>
            <NavLink onClick={toggleCollapsed} to={`${path}users`}>
              Users
            </NavLink>
          </Menu.Item>
        )}
      </Menu>
    </>
  );
}

MenuItems.propTypes = {
  darkMode: propTypes.bool,
  topMenu: propTypes.bool,
  toggleCollapsed: propTypes.func,
};

export default MenuItems;