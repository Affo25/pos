import React, { useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { InfoWraper, UserDropDwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import { logoutUser } from '../../../redux/authentication/authSlice';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatClock(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function roleLabel(userType) {
  if (!userType) return '';
  if (userType === 'superAdmin') return 'SUPER ADMIN';
  return String(userType).replace(/([A-Z])/g, ' $1').trim().toUpperCase();
}

function AuthInfo() {
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.auth);
  const { path } = useRouteMatch();
  const profilePath = `${path}profile`;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const SignOut = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
  };

  const initial = (login?.name || '?').trim().charAt(0).toUpperCase();
  const displayRole = roleLabel(login?.user_type);

  const userContent = (
    <UserDropDwon style={{ width: '240px' }}>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="shell-popover-avatar">{initial}</div>
          <figcaption style={{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }}>
            <Heading as="h5" style={{ margin: 0 }}>
              {login?.name || 'Guest'}
            </Heading>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{displayRole}</p>
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
    <InfoWraper className="shell-header-bar">
      <span className="shell-clock" aria-live="polite">
        {formatClock(now)}
      </span>

      <Popover placement="bottomRight" content={userContent} action="click">
        <button type="button" className="shell-user-block" aria-label="Account menu">
          <span className="shell-user-avatar">{initial}</span>
          <span className="shell-user-text">
            <span className="shell-user-name">{login?.name || 'Guest'}</span>
            <span className="shell-user-role">{displayRole}</span>
          </span>
        </button>
      </Popover>

      <button type="button" className="shell-logout-btn" onClick={SignOut}>
        <FeatherIcon icon="log-out" size={16} />
        <span>Logout</span>
      </button>
    </InfoWraper>
  );
}

export default AuthInfo;
