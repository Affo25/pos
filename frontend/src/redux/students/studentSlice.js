import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'students',
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
    fetchStudentsSuccess(state, action) {
      state.students = action.payload;
    },
    clearStudents(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllStudents = (branchId) => ({ type: 'students/fetchAll', payload: branchId });
const createStudent = (studentData) => ({ type: 'students/create', payload: studentData });
const updateStudent = (id, data) => ({ type: 'students/update', payload: { id, data } });
const deleteStudent = (id, branchId) => ({ type: 'students/delete', payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchStudentsSuccess,
  clearStudents,
} = studentSlice.actions;

export { fetchAllStudents, createStudent, updateStudent, deleteStudent };

export default studentSlice.reducer;