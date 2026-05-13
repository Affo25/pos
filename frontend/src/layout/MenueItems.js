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

  const getSelectedKey = () => {
    if (pathSegments.length === 0) return ['home'];

    const page = pathSegments[0].toLowerCase();

    const menuKeys = {
      users: 'Users',
      pages: 'Pages',
      products: 'Products',
      categorys: 'Categorys',
      sales: 'Sales',
      'pos-billing': 'POSBilling',
      'stock-management': 'StockManagement',
      suppliers: 'Suppliers',
      purchaseorders: 'PurchaseOrders',
      settings: 'Settings',
    };

    return menuKeys[page] ? [menuKeys[page]] : [];
  };

  const selectedKey = !topMenu ? getSelectedKey() : [];

  useEffect(() => {
    dispatch(fetchAllBranchProfiles());
  }, [dispatch]);

  useEffect(() => {
    if (branchprofiles.length > 0) {
      const firstBranchId = selectedBranchId || branchprofiles[0]._id;
      dispatch(setSelectedBranch(firstBranchId));
    }
  }, [branchprofiles, selectedBranchId, dispatch]);

  const groupTitle = (label) => <span className="sidebar-group-label">{label}</span>;

  return (
    <>
      <Menu
        mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
        theme={darkMode ? 'dark' : 'light'}
        selectedKeys={selectedKey}
        overflowedIndicator={<FeatherIcon icon="more-vertical" />}
      >
        <Menu.ItemGroup title={groupTitle('Insights')}>
          <Menu.Item key="home" icon={!topMenu && <FeatherIcon icon="home" />}>
            <NavLink onClick={toggleCollapsed} to={`${path}`}>
              Dashboard
            </NavLink>
          </Menu.Item>
        </Menu.ItemGroup>

        <Menu.ItemGroup title={groupTitle('Sales')}>
          {canAccess('sales') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="shopping-cart" />} key="POSBilling">
              <NavLink onClick={toggleCollapsed} to={`${path}pos-billing`}>
                Sell
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('sales') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="file-text" />} key="Sales">
              <NavLink onClick={toggleCollapsed} to={`${path}sales`}>
                Sales
              </NavLink>
            </Menu.Item>
          )}
        </Menu.ItemGroup>

        <Menu.ItemGroup title={groupTitle('Inventory')}>
          {canAccess('categorys') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="layers" />} key="Categorys">
              <NavLink onClick={toggleCollapsed} to={`${path}categorys`}>
                Categories
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('products') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="package" />} key="Products">
              <NavLink onClick={toggleCollapsed} to={`${path}products`}>
                Products
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
        </Menu.ItemGroup>

        <Menu.ItemGroup title={groupTitle('Purchasing')}>
          {canAccess('purchaseorders') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="shopping-bag" />} key="PurchaseOrders">
              <NavLink onClick={toggleCollapsed} to={`${path}purchaseorders`}>
                Purchase Orders
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('suppliers') && (
            <Menu.Item icon={!topMenu && <FeatherIcon icon="truck" />} key="Suppliers">
              <NavLink onClick={toggleCollapsed} to={`${path}suppliers`}>
                Suppliers
              </NavLink>
            </Menu.Item>
          )}
        </Menu.ItemGroup>

        {canAccess('settings') && (
          <Menu.ItemGroup title={groupTitle('Settings')}>
            <Menu.Item key="Settings" icon={!topMenu && <FeatherIcon icon="settings" />}>
              <NavLink onClick={toggleCollapsed} to={`${path}settings`}>
                Invoice & branding
              </NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
        )}

        {canAccess('users') && user?.user_type === 'superAdmin' && (
          <Menu.ItemGroup title={groupTitle('System')}>
            <Menu.Item key="Users" icon={!topMenu && <FeatherIcon icon="users" />}>
              <NavLink onClick={toggleCollapsed} to={`${path}users`}>
                Users
              </NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
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
