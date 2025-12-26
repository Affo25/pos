import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clients: [],
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'clients',
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
    fetchClientsSuccess(state, action) {
      state.clients = action.payload;
    },
    clearClients(state) {
      state.staffs = [];
    },
  },
});

const fetchAllClients = () => ({ type: 'clients/fetchAll' });
const createClient = (clientData, meta) => ({ type: 'clients/create', payload: clientData, meta });
const updateClient = (id, data) => ({ type: 'clients/update', payload: { id, data } });
const deleteClient = (id) => ({ type: 'clients/delete', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchClientsSuccess,
  clearClients,
} = clientSlice.actions;

export { fetchAllClients, createClient, updateClient, deleteClient };

export default clientSlice.reducer;