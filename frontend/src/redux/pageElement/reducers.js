import actions from './actions';

const {
  SINGLE_PAGE_ELEMENT_BEGIN,
  SINGLE_PAGE_ELEMENT_SUCCESS,
  SINGLE_PAGE_ELEMENT_ERR,

  FETCH_PAGE_ELEMENTS_BEGIN,
  FETCH_PAGE_ELEMENTS_SUCCESS,
  FETCH_PAGE_ELEMENTS_ERR,

  RESET_PAGE_ELEMENTS,
} = actions;

const initialListState = {
  data: [],
  loading: false,
  error: null,
};

const pageElementReducer = (state = initialListState, action) => {
  const { type, data, err } = action;

  switch (type) {
    case FETCH_PAGE_ELEMENTS_BEGIN:
      return { ...state, loading: true, error: null };
    case FETCH_PAGE_ELEMENTS_SUCCESS:
      return { ...state, loading: false, data };
    case FETCH_PAGE_ELEMENTS_ERR:
      return { ...state, loading: false, error: err };
    case RESET_PAGE_ELEMENTS:
      return initialListState;
    default:
      return state;
  }
};

const initialSingleState = {
  data: null,
  loading: false,
  error: null,
};

const singlePageElementReducer = (state = initialSingleState, action) => {
  const { type, data, err } = action;

  switch (type) {
    case SINGLE_PAGE_ELEMENT_BEGIN:
      return { ...state, loading: true, error: null };
    case SINGLE_PAGE_ELEMENT_SUCCESS:
      return { ...state, loading: false, data };
    case SINGLE_PAGE_ELEMENT_ERR:
      return { ...state, loading: false, error: err };
    default:
      return state;
  }
};

export { pageElementReducer, singlePageElementReducer };
