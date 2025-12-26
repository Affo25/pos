import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kirlas: [],
  loading: false,
  error: null,
};

const kirlaSlice = createSlice({
  name: 'kirlas',
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
    fetchKirlasSuccess(state, action) {
      state.kirlas = action.payload;
    },
  },
});

const fetchAllKirlas = () => ({ type: 'kirlas/fetchAll' });
const createKirla = (kirlaData) => ({ type: 'kirlas/create', payload: kirlaData });
const updateKirla = (id, data) => ({ type: 'kirlas/update', payload: { id, data } });
const deleteKirla = (id) => ({ type: 'kirlas/delete', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchKirlasSuccess,
} = kirlaSlice.actions;

export { fetchAllKirlas, createKirla, updateKirla, deleteKirla };

export default kirlaSlice.reducer;