import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskmanagements: [],
  loading: false,
  error: null,
};

const taskmanagementSlice = createSlice({
  name: 'taskmanagements',
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
    fetchTaskManagementsSuccess(state, action) {
      state.taskmanagements = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllTaskManagements = (branchId) => ({ type: 'taskmanagements/fetchAll', payload: branchId });
const createTaskManagement = (taskmanagementData) => ({ type: 'taskmanagements/create', payload: taskmanagementData });
const updateTaskManagement = (id, data) => ({ type: 'taskmanagements/update', payload: { id, data } });
const deleteTaskManagement = (id, branchId) => ({ type: 'taskmanagements/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchTaskManagementsSuccess,
} = taskmanagementSlice.actions;

export { fetchAllTaskManagements, createTaskManagement, updateTaskManagement, deleteTaskManagement };

export default taskmanagementSlice.reducer;