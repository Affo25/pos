import React from 'react';
import propTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

function ProtectedRoute({ component, path }) {
  const isLoggedIn = useSelector(state => state.auth.login);

  const token = Cookies.get('token');
  const isValidToken = token && token.split('.').length === 3;

  if (!isLoggedIn || !isValidToken) {
    Cookies.remove('token');
    localStorage.removeItem('loginData');
    return <Redirect to="/" />;
  }

  return <Route component={component} path={path} />;
}

ProtectedRoute.propTypes = {
  component: propTypes.object.isRequired,
  path: propTypes.string.isRequired,
};

export default ProtectedRoute;
