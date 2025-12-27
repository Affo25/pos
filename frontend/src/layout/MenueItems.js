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
    if (['superAdmin', 'admin', 'moderator'].includes(user.user_type)) {
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
      teachers: 'Teachers',
      kirlas: 'Kirlas',
      clients: 'Clients',
      branchprofiles: 'BranchProfiles',
      faculties: 'Faculties',
      departments: 'Departments',
      subjects: 'Subjects',
      accountheads: 'Accountheads',
      feeheads: 'Feeheads',
      classtypes: 'ClassTypes',
      notices: 'Notices',
      newses: 'Newses',
      nonacademics: 'NonAcademics',
      events: 'Events',
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

  // const handleBranchChange = (value) => {
  //   dispatch(setSelectedBranch(value));
  // };

  return (
    <>
      <div style={{ padding: '8px 15px' }}>
        {/* {branchprofiles.length > 0 && selectedBranchId ? (
          <Select
            value={selectedBranchId}
            onChange={handleBranchChange}
            placeholder="Choose a branch"
            style={{ minWidth: 200 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            {branchprofiles.map((bp) => (
              <Select.Option key={bp._id} value={bp._id}>
                {bp.branch_name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <span>Loading branches...</span>
        )} */}
      </div>
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

          {canAccess('classtypes') && (
            <Menu.Item key="ClassTypes">
              <NavLink onClick={toggleCollapsed} to={`${path}classtypes`}>
                Class Types
              </NavLink>
            </Menu.Item>
          )}

          {canAccess('departments') && (
            <Menu.Item key="Departments">
              <NavLink onClick={toggleCollapsed} to={`${path}departments`}>
                Departments
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('subjects') && (
            <Menu.Item key="Subjects">
              <NavLink onClick={toggleCollapsed} to={`${path}subjects`}>
                Subjects
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('feeheads') && (
            <Menu.Item key="Feeheads">
              <NavLink onClick={toggleCollapsed} to={`${path}feeheads`}>
                Fee Heads
              </NavLink>
            </Menu.Item>
          )}
          {canAccess('accountheads') && (
            <Menu.Item key="Accountheads">
              <NavLink onClick={toggleCollapsed} to={`${path}Accountheads`}>
                Account Heads
              </NavLink>
            </Menu.Item>
          )}
        </Menu.SubMenu>
        {canAccess('clients') && (
          <Menu.Item key="Clients" icon={!topMenu && <FeatherIcon icon="user" />}>
            <NavLink onClick={toggleCollapsed} to={`${path}clients`}>
              Clients
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('notices') && (
          <Menu.Item key="Notices">
            <NavLink onClick={toggleCollapsed} to={`${path}notices`}>
              Notice
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('newses') && (
          <Menu.Item key="Newses">
            <NavLink onClick={toggleCollapsed} to={`${path}news`}>
              News
            </NavLink>
          </Menu.Item>
        )}
        {canAccess('events') && (
          <Menu.Item key="Events">
            <NavLink onClick={toggleCollapsed} to={`${path}events`}>
              Events
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
