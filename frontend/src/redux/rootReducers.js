import { combineReducers } from '@reduxjs/toolkit';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import themeUsersReducer from './themeUsers/reducers';
import authReducer from './authentication/authSlice';
import ChangeLayoutMode from './themeLayout/reducers';
import { teamReducer } from './team/reducers';
import { headerSearchReducer } from './headerSearch/reducers';
import chartContentReducer from './chartContent/reducers';
import { chatReducer, SingleChatReducer, groupChatReducer, SingleChatGroupReducer } from './chat/reducers';
import { readMessageReducer } from './message/reducers';
import { readNotificationReducer } from './notification/reducers';
import Todo from './todo/reducers';
import Note from './note/reducers';
import FileManager from './fileManager/reducers';
import { axiosCrudReducer, axiosSingleCrudReducer } from './crud/axios/reducers';
import { fsCrudReducer, fsSingleCrudReducer } from './firebase/firestore/reducers';
import firebaseAuth from './firebase/auth/reducers';
import userReducer from './users/userSlice';
import branchprofileReducer from './branchprofiles/branchprofileSlice';
import facultiesReducer from './faculties/facultiesSlice';
import productReducer from './products/productSlice';
import categoryReducer from './categorys/categorySlice';
import subcategoryReducer from './subcategorys/subcategorySlice';
import customerReducer from './customers/customerSlice';
import saleReducer from './sales/saleSlice';
import supplierReducer from './suppliers/supplierSlice';
import purchaseorderReducer from './purchaseorders/purchaseorderSlice';
import selectedBranchReducer from './selectedBranch/selectedBranchSlice';

const rootReducers = combineReducers({
  fb: firebaseReducer,
  fs: firestoreReducer,
  themeUsers: themeUsersReducer,
  headerSearchData: headerSearchReducer,
  message: readMessageReducer,
  notification: readNotificationReducer,
  users: userReducer,
  // userGroup: userGroupReducer,
  team: teamReducer,
  chatSingle: SingleChatReducer,
  chatSingleGroup: SingleChatGroupReducer,
  chat: chatReducer,
  groupChat: groupChatReducer,
  auth: authReducer,
  chartContent: chartContentReducer,
  crud: fsCrudReducer,
  singleCrud: fsSingleCrudReducer,
  Todo,
  Note,
  firebaseAuth,
  FileManager,
  AxiosCrud: axiosCrudReducer,
  SingleAxiosCrud: axiosSingleCrudReducer,
  ChangeLayoutMode,
  branchprofiles: branchprofileReducer,
  faculties: facultiesReducer,
  seletedBranch: selectedBranchReducer,
  products: productReducer,
  categorys: categoryReducer,
  subcategorys: subcategoryReducer,
  customers: customerReducer,
  sales: saleReducer,
  suppliers: supplierReducer,
  purchaseorders: purchaseorderReducer,
});

export default rootReducers;
