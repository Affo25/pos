const actions = {
  SINGLE_PAGE_BEGIN: 'SINGLE_PAGE_BEGIN',
  SINGLE_PAGE_SUCCESS: 'SINGLE_PAGE_SUCCESS',
  SINGLE_PAGE_ERR: 'SINGLE_PAGE_ERR',

  FILTER_PAGE_BEGIN: 'FILTER_PAGE_BEGIN',
  FILTER_PAGE_SUCCESS: 'FILTER_PAGE_SUCCESS',
  FILTER_PAGE_ERR: 'FILTER_PAGE_ERR',

  SORTING_PAGE_BEGIN: 'SORTING_PAGE_BEGIN',
  SORTING_PAGE_SUCCESS: 'SORTING_PAGE_SUCCESS',
  SORTING_PAGE_ERR: 'SORTING_PAGE_ERR',

  singlePageBegin: () => {
    return {
      type: actions.SINGLE_PAGE_BEGIN,
    };
  },

  singlePageSuccess: (data) => {
    return {
      type: actions.SINGLE_PAGE_SUCCESS,
      data,
    };
  },

  singlePageErr: (err) => {
    return {
      type: actions.SINGLE_PAGE_ERR,
      err,
    };
  },

  filterPageBegin: () => {
    return {
      type: actions.FILTER_PAGE_BEGIN,
    };
  },

  filterPageSuccess: (data) => {
    return {
      type: actions.FILTER_PAGE_SUCCESS,
      data,
    };
  },

  filterPageErr: (err) => {
    return {
      type: actions.FILTER_PAGE_ERR,
      err,
    };
  },

  sortingPageBegin: () => {
    return {
      type: actions.SORTING_PAGE_BEGIN,
    };
  },

  sortingPageSuccess: (data) => {
    return {
      type: actions.SORTING_PAGE_SUCCESS,
      data,
    };
  },

  sortingPageErr: (err) => {
    return {
      type: actions.SORTING_PAGE_ERR,
      err,
    };
  },
};

export default actions;
