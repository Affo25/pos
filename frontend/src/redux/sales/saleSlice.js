import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [],
  loading: false,
  error: null,
};

const saleSlice = createSlice({
  name: 'sales',
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
    fetchSalesSuccess(state, action) {
      state.sales = action.payload;
    },
  },
});

const fetchAllSales = () => ({ type: 'sales/fetchAll'});
const createSale = (saleData) => ({ type: 'sales/create', payload: saleData });
const updateSale = ({ id, saleData }) => ({ type: 'sales/update', payload: { id, data: saleData } });
const processReturn = (returnData) => ({ type: 'sales/processReturn', payload: returnData });
const deleteSale = (id) => ({ type: 'sales/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSalesSuccess,
} = saleSlice.actions;

export { fetchAllSales, createSale, updateSale, deleteSale, processReturn };

export default saleSlice.reducer;