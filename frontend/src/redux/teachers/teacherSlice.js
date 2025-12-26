import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teachers: [],
  loading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: 'teachers',
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
    fetchTeachersSuccess(state, action) {
      state.teachers = action.payload;
    },
  },
});

const fetchAllTeachers = () => ({ type: 'teachers/fetchAll' });
const createTeacher = (teacherData) => ({ type: 'teachers/create', payload: teacherData });
const updateTeacher = (id, data) => ({ type: 'teachers/update', payload: { id, data } });
const deleteTeacher = (id) => ({ type: 'teachers/delete', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTeachersSuccess,
} = teacherSlice.actions;

export { fetchAllTeachers, createTeacher, updateTeacher, deleteTeacher };

export default teacherSlice.reducer;