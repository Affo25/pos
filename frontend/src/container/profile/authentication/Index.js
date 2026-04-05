import React from 'react';

/** Full-page auth (login, register, etc.) — each route provides its own layout. */
const AuthLayout = (WraperContent) => {
  return function () {
    return <WraperContent />;
  };
};

export default AuthLayout;
