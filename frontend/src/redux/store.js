import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import firebase from 'firebase/app';
import { getFirebase } from 'react-redux-firebase';
import { reduxFirestore, getFirestore, createFirestoreInstance } from 'redux-firestore';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './rootReducers';
import rootSaga from './rootSaga';
import fbConfig from '../config/database/firebase';

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = process.env.NODE_ENV === 'development'
  ? composeWithDevTools
  : compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    reduxFirestore(fbConfig),
    applyMiddleware(
      thunk.withExtraArgument({ getFirebase, getFirestore }),
      sagaMiddleware
    )
  )
);

sagaMiddleware.run(rootSaga);

export const rrfProps = {
  firebase,
  config: fbConfig,
  dispatch: store.dispatch,
  createFirestoreInstance,
  userProfile: 'users',
  useFirestoreForProfile: true,
  attachAuthIsReady: true
};

export default store;