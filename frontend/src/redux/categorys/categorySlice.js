import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categorys: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categorys',
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
    fetchCategorysSuccess(state, action) {
      state.categorys = action.payload;
    },
  },
});

const fetchAllCategorys = () => ({ type: 'categorys/fetchAll'});
const createCategory = (categoryData) => ({ type: 'categorys/create', payload: categoryData });
const updateCategory = (id, data) => ({ type: 'categorys/update', payload: { id, data } });
const deleteCategory = (id) => ({ type: 'categorys/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchCategorysSuccess,
} = categorySlice.actions;

export { fetchAllCategorys, createCategory, updateCategory, deleteCategory };

export default categorySlice.reducer;