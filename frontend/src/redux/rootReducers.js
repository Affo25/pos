import { combineReducers } from '@reduxjs/toolkit';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import themeUsersReducer from './themeUsers/reducers';
import pageReducer from './pages/pageSlice';
// import authReducer from './authentication/reducers';
import authReducer from './authentication/authSlice';
import ChangeLayoutMode from './themeLayout/reducers';
import { teamReducer } from './team/reducers';
// import { userReducer, userGroupReducer } from './users/reducers';
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
import pageElementReducer from './pageElements/pageElementSlice';
import teacherReducer from './teachers/teacherSlice';
import userReducer from './users/userSlice';
import kirlaReducer from './kirlas/kirlaSlice';
import branchprofileReducer from './branchprofiles/branchprofileSlice';
import facultiesReducer from './faculties/facultiesSlice';
import departmentReducer from './departments/departmentSlice';
import subjectsReducer from './subjects/subjectsSlice';
import accountheadsReducer from './accountheads/accountheadsSlice';
import feeheadsReducer from './feeheads/feeheadsSlice';
import clientReducer from './clients/clientSlice';
import selectedBranchReducer from './selectedBranch/selectedBranchSlice';

import classtypeReducer from './classtypes/classtypeSlice';
import noticeReducer from './notices/noticeSlice';
import newseReducer from './newses/newseSlice';
import nonacademicReducer from './nonacademics/nonacademicSlice';
import eventReducer from './events/eventSlice';
import { pageDataReducer, singlePageDataReducer } from './pageData/reducers';

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
  pages: pageReducer,
  chartContent: chartContentReducer,
  crud: fsCrudReducer,
  singleCrud: fsSingleCrudReducer,
  Todo,
  Note,
  firebaseAuth,
  FileManager,
  AxiosCrud: axiosCrudReducer,
  SingleAxiosCrud: axiosSingleCrudReducer,
  pageElements: pageElementReducer,
  pageDatas: pageDataReducer,
  pageData: singlePageDataReducer,
  ChangeLayoutMode,
  teachers: teacherReducer,
  kirlas: kirlaReducer,
  branchprofiles: branchprofileReducer,
  faculties: facultiesReducer,
  departments: departmentReducer,
  subjects: subjectsReducer,
  accountheads: accountheadsReducer,
  feeHeads: feeheadsReducer,
  clients: clientReducer,
  seletedBranch: selectedBranchReducer,
  classtypes: classtypeReducer,
  notices: noticeReducer,
  newses: newseReducer,
  nonacademics: nonacademicReducer,
  events: eventReducer,
});

export default rootReducers;
