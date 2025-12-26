const actions = {
  SINGLE_PAGE_ELEMENT_BEGIN: 'SINGLE_PAGE_ELEMENT_BEGIN',
  SINGLE_PAGE_ELEMENT_SUCCESS: 'SINGLE_PAGE_ELEMENT_SUCCESS',
  SINGLE_PAGE_ELEMENT_ERR: 'SINGLE_PAGE_ELEMENT_ERR',

  FETCH_PAGE_ELEMENTS_BEGIN: 'FETCH_PAGE_ELEMENTS_BEGIN',
  FETCH_PAGE_ELEMENTS_SUCCESS: 'FETCH_PAGE_ELEMENTS_SUCCESS',
  FETCH_PAGE_ELEMENTS_ERR: 'FETCH_PAGE_ELEMENTS_ERR',

  RESET_PAGE_ELEMENTS: 'RESET_PAGE_ELEMENTS',

  singlePageElementBegin: () => ({ type: actions.SINGLE_PAGE_ELEMENT_BEGIN }),
  singlePageElementSuccess: (data) => ({ type: actions.SINGLE_PAGE_ELEMENT_SUCCESS, data }),
  singlePageElementErr: (err) => ({ type: actions.SINGLE_PAGE_ELEMENT_ERR, err }),

  fetchPageElementsBegin: () => ({ type: actions.FETCH_PAGE_ELEMENTS_BEGIN }),
  fetchPageElementsSuccess: (data) => ({ type: actions.FETCH_PAGE_ELEMENTS_SUCCESS, data }),
  fetchPageElementsErr: (err) => ({ type: actions.FETCH_PAGE_ELEMENTS_ERR, err }),

  resetPageElements: () => ({ type: actions.RESET_PAGE_ELEMENTS }),
};

export default actions;
