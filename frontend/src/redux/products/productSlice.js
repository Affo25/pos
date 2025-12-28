import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
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
    fetchProductsSuccess(state, action) {
      state.products = action.payload;
    },
  },
});

const fetchAllProducts = () => ({ type: 'products/fetchAll'});
const createProduct = (productData) => ({ type: 'products/create', payload: productData });
const updateProduct = (id, data) => ({ type: 'products/update', payload: { id, data } });
const deleteProduct = (id) => ({ type: 'products/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchProductsSuccess,
} = productSlice.actions;

export { fetchAllProducts, createProduct, updateProduct, deleteProduct };

export default productSlice.reducer;