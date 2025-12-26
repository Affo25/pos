import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: 'departments',
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
    fetchDepartmentsSuccess(state, action) {
      state.departments = action.payload;
    },
    clearDepartments(state) {
      state.staffs = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllDepartments = (branchId) => ({ type: 'departments/fetchAll', payload: branchId });
const createDepartment = (departmentData) => ({ type: 'departments/create', payload: departmentData });
const updateDepartment = (id, data) => ({ type: 'departments/update', payload: { id, data } });
const deleteDepartment = (id, branchId) => ({ type: 'departments/delete', payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchDepartmentsSuccess,
  clearDepartments,
} = departmentSlice.actions;

export { fetchAllDepartments, createDepartment, updateDepartment, deleteDepartment };

export default departmentSlice.reducer;