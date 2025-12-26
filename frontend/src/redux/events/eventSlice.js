import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
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
    fetchEventsSuccess(state, action) {
      state.events = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

const fetchAllEvents = (branchId) => ({ type: 'events/fetchAll', payload: branchId });
const createEvent = (eventData) => ({ type: 'events/create', payload: eventData });
const updateEvent = (id, data) => ({ type: 'events/update', payload: { id, data } });
const deleteEvent = (id, branchId) => ({ type: 'events/delete',payload: { id, branchId } });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchEventsSuccess,
} = eventSlice.actions;

export { fetchAllEvents, createEvent, updateEvent, deleteEvent };

export default eventSlice.reducer;