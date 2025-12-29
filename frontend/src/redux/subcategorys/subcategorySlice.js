import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subcategorys: [],
  loading: false,
  error: null,
};

const subcategorySlice = createSlice({
  name: 'subcategorys',
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
    fetchSubCategorysSuccess(state, action) {
      state.subcategorys = action.payload;
    },
  },
});

const fetchAllSubCategorys = () => ({ type: 'subcategorys/fetchAll'});
const createSubCategory = (subcategoryData) => ({ type: 'subcategorys/create', payload: subcategoryData });
const updateSubCategory = (id, data) => ({ type: 'subcategorys/update', payload: { id, data } });
const deleteSubCategory = (id) => ({ type: 'subcategorys/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchSubCategorysSuccess,
} = subcategorySlice.actions;

export { fetchAllSubCategorys, createSubCategory, updateSubCategory, deleteSubCategory };

export default subcategorySlice.reducer;