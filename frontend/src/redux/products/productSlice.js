import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
   categories: [],
   suppliers: [],
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
  
    fetchCategoriesSuccess(state, action) {
      state.categories = action.payload;
    },
    fetchSuppliersSuccess(state, action) {
      state.suppliers = action.payload;
    }
  },
});

const fetchAllProducts = () => ({ type: 'products/fetchAll' });
const fetchAllCategories = () => ({ type: 'products/fetchCategories' });
const fetchAllSuppliers = () => ({ type: 'products/fetchSuppliers' });

const createProduct = (productData) => ({ type: 'products/create', payload: productData });
const updateProduct = (id, data) => ({ type: 'products/update', payload: { id, data } });
const deleteProduct = (id) => ({ type: 'products/delete', payload: id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchProductsSuccess,
  fetchCategoriesSuccess,
  fetchSuppliersSuccess
} = productSlice.actions;

export { fetchAllProducts, fetchAllCategories, fetchAllSuppliers, createProduct, updateProduct, deleteProduct };

export default productSlice.reducer;