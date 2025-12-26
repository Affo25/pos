import actions from './actions';

const {
  SINGLE_PAGE_BEGIN,
  SINGLE_PAGE_SUCCESS,
  SINGLE_PAGE_ERR,

  FILTER_PAGE_BEGIN,
  FILTER_PAGE_SUCCESS,
  FILTER_PAGE_ERR,

  SORTING_PAGE_BEGIN,
  SORTING_PAGE_SUCCESS,
  SORTING_PAGE_ERR,
} = actions;

const initialStateFilter = {
  data: [],
  loading: false,
  error: null,
};

const pageReducer = (state = initialStateFilter, action) => {
  const { type, data, err } = action;
  switch (type) {
    case FILTER_PAGE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FILTER_PAGE_SUCCESS:
      return {
        ...state,
        data: data || [],
        loading: false,
      };
    case FILTER_PAGE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case SORTING_PAGE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SORTING_PAGE_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
      };
    case SORTING_PAGE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const SinglePageReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case SINGLE_PAGE_BEGIN:
      return {
        ...initialState,
        loading: true,
      };
    case SINGLE_PAGE_SUCCESS:
      return {
        ...initialState,
        data,
        loading: false,
      };
    case SINGLE_PAGE_ERR:
      return {
        ...initialState,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

export { SinglePageReducer, pageReducer };
