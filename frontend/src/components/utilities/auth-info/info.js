import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { InfoWraper, UserDropDwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import { logoutUser } from '../../../redux/authentication/authSlice';

function AuthInfo() {
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.auth);
  const { path } = useRouteMatch();
  const profilePath = `${path}profile`;

  const SignOut = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
  };

  const userContent = (
    <UserDropDwon style={{ width: '240px' }}>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info" style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/static/img/avatar/chat-auth.png" size={50} icon={<UserOutlined />} alt="User" />
          <figcaption style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
            <Heading as="h5" style={{ margin: 0 }}>
              {login?.name || 'Guest'}
            </Heading>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{login?.user_type || ''}</p>
          </figcaption>
        </figure>
        <ul className="user-dropdwon__links">
          <li>
            <Link to={profilePath}>
              <FeatherIcon icon="user" /> Profile
            </Link>
          </li>
        </ul>
        <Link className="user-dropdwon__bottomAction" onClick={SignOut} to="#">
          <FeatherIcon icon="log-out" /> Sign Out
        </Link>
      </div>
    </UserDropDwon>
  );

  return (
    <InfoWraper>
      <div className="nav-author">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="head-example" aria-label="Account menu">
            <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
}

export default AuthInfo;
