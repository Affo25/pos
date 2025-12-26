import actions from './actions';

const {
  SINGLE_PAGE_DATA_BEGIN,
  SINGLE_PAGE_DATA_SUCCESS,
  SINGLE_PAGE_DATA_ERR,

  FETCH_PAGE_DATAS_BEGIN,
  FETCH_PAGE_DATAS_SUCCESS,
  FETCH_PAGE_DATAS_ERR,
  UPDATE_PAGE_DATA_SUCCESS,
  DELETE_PAGE_DATA_SUCCESS,

  RESET_PAGE_DATAS,
} = actions;

// For list of page data
const initialListState = {
  data: [],
  loading: false,
  error: null,
};

const pageDataReducer = (state = initialListState, action) => {
  const { type, err } = action;

  switch (type) {
    case FETCH_PAGE_DATAS_BEGIN:
      return { ...state, loading: true, error: null };
    case FETCH_PAGE_DATAS_SUCCESS:
      return {
        ...state, loading: false, data: action.data || [],
        error: null
      };
    case FETCH_PAGE_DATAS_ERR:
      return { ...state, loading: false, error: err };

    case UPDATE_PAGE_DATA_SUCCESS:
      return {
        ...state,
        data: state.data.map(item =>
          item._id === action.data._id ? action.data : item // eslint-disable-line no-underscore-dangle
        ),
        loading: false,
        error: null
      };
    case DELETE_PAGE_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: state.data.filter(item => item.id !== action.id),
        error: null
      };
    case RESET_PAGE_DATAS:
      return initialListState;
    default:
      return state;
  }
};

// For single page data
const initialSingleState = {
  data: null,
  loading: false,
  error: null,
};

const singlePageDataReducer = (state = initialSingleState, action) => {
  const { type, err } = action;

  switch (type) {
    case SINGLE_PAGE_DATA_BEGIN:
      return { ...state, loading: true, error: null };
    case SINGLE_PAGE_DATA_SUCCESS:
      return { ...state, loading: false, data: action.data };
    case SINGLE_PAGE_DATA_ERR:
      return { ...state, loading: false, error: err };
    default:
      return state;
  }
};

export { pageDataReducer, singlePageDataReducer };

