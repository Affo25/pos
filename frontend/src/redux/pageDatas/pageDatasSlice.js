import { createSlice } from '@reduxjs/toolkit';

// Shuru mein state kaisa dikhega
const initialState = {
  pageDatas: [], // Saari list yahan ayegi
  current: null, // Single item yahan ayega
  loading: false, // Loading show karne ke liye
  error: null, // Koi error aya toh yahan ayega
};

const pageDataSlice = createSlice({
  name: 'pageDatas',
  initialState,
  reducers: {
    // 1. Operation shuru hone par (loading ON)
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    // 2. Operation successful hone par (loading OFF)
    operationSuccess(state) {
      state.loading = false;
    },
    // 3. Operation fail hone par (error dikhao)
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // 4. List successfully fetch hone par
    fetchListSuccess(state, action) {
      state.pageDatas = action.payload;
    },
    // 5. Single item successfully fetch hone par
    fetchSingleSuccess(state, action) {
      state.current = action.payload;
    },
    // 6. State ko reset kardo
    resetPageDatas(state) {
      state.pageDatas = [];
      state.current = null;
      state.error = null;
    },
  },
});

// Actions ko export kardo (components mein use karne ke liye)
export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetchListSuccess,
  fetchSingleSuccess,
  resetPageDatas,
} = pageDataSlice.actions;

// Redux actions jo saga ko trigger karengi
export const fetchPageDataByPageId = (pageId) => ({ type: 'pageDatas/fetchAll', payload: pageId });
export const fetchPageDataById = (id) => ({ type: 'pageDatas/fetchOne', payload: id });
export const createPageData = (data) => ({ type: 'pageDatas/create', payload: data });
export const updatePageData = (id, data) => ({  type: 'pageDatas/update', payload: { id, data } });
export const deletePageData = (id, pageTitle) => ({ type: 'pageDatas/delete', payload: { id, pageTitle } });

// Reducer ko export kardo (store mein use karne ke liye)
export default pageDataSlice.reducer;