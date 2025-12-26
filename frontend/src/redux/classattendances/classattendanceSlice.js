import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classattendances: [],
  summary: [],
  loading: false,
  error: null,
};

const classattendanceSlice = createSlice({
  name: 'classattendances',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    operationSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchClassAttendancesSuccess(state, action) {
      state.classattendances = action.payload;
    },
    fetchClassAttendanceSummarySuccess(state, action) {
      state.summary = action.payload;
    },
  },
});

const fetchAllClassAttendances = (branchId) => ({ type: 'classattendances/fetchAll', payload: branchId });
const createClassAttendance = (classattendanceData) => ({ type: 'classattendances/create', payload: classattendanceData });
const updateClassAttendance = (id, data) => ({ type: 'classattendances/update', payload: { id, data } });
const deleteClassAttendance = (id, branchId) => ({ type: 'classattendances/delete', payload: { id, branchId } });
const fetchClassAttendanceSummary = (params) => ({
  type: 'classattendances/fetchSummary',
  payload: params
});

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClassAttendancesSuccess,
  fetchClassAttendanceSummarySuccess
} = classattendanceSlice.actions;

export { fetchAllClassAttendances, createClassAttendance, updateClassAttendance, deleteClassAttendance, fetchClassAttendanceSummary };

export default classattendanceSlice.reducer;