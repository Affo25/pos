/* eslint-disable import/no-unresolved */
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'js-cookie';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import 'react-notifications/lib/notifications.css';

/* Ant Design Modal/Select + PDF preview can trigger a benign ResizeObserver warning in dev. */
if (typeof window !== 'undefined') {
  const roMsg = /ResizeObserver loop (completed with undelivered notifications)?/;
  const prevOnError = window.onerror;
  window.onerror = (message, ...rest) => {
    if (typeof message === 'string' && roMsg.test(message)) {
      return true;
    }
    if (prevOnError) {
      return prevOnError(message, ...rest);
    }
    return false;
  };
  window.addEventListener(
    'error',
    (event) => {
      if (roMsg.test(event.message || '')) {
        event.stopImmediatePropagation();
      }
    },
    true,
  );
}

const token = Cookies.get('token');
if (!token || token.split('.').length !== 3) {
    Cookies.remove('token');
    localStorage.removeItem('loginData');
}


const root = createRoot(document.getElementById('root'));
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
