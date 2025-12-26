const actions = {
  SINGLE_PAGE_DATA_BEGIN: 'SINGLE_PAGE_DATA_BEGIN',
  SINGLE_PAGE_DATA_SUCCESS: 'SINGLE_PAGE_DATA_SUCCESS',
  SINGLE_PAGE_DATA_ERR: 'SINGLE_PAGE_DATA_ERR',

  FETCH_PAGE_DATAS_BEGIN: 'FETCH_PAGE_DATAS_BEGIN',
  FETCH_PAGE_DATAS_SUCCESS: 'FETCH_PAGE_DATAS_SUCCESS',
  FETCH_PAGE_DATAS_ERR: 'FETCH_PAGE_DATAS_ERR',

  UPDATE_PAGE_DATA_BEGIN: 'UPDATE_PAGE_DATA_BEGIN',
  UPDATE_PAGE_DATA_SUCCESS: 'UPDATE_PAGE_DATA_SUCCESS',
  UPDATE_PAGE_DATA_ERR: 'UPDATE_PAGE_DATA_ERR',

  DELETE_PAGE_DATA_BEGIN: 'DELETE_PAGE_DATA_BEGIN',
  DELETE_PAGE_DATA_SUCCESS: 'DELETE_PAGE_DATA_SUCCESS',
  DELETE_PAGE_DATA_ERR: 'DELETE_PAGE_DATA_ERR',

  RESET_PAGE_DATAS: 'RESET_PAGE_DATAS',

  singlePageDataBegin: () => ({ type: actions.SINGLE_PAGE_DATA_BEGIN }),
  singlePageDataSuccess: (data) => ({ type: actions.SINGLE_PAGE_DATA_SUCCESS, data }),
  singlePageDataErr: (err) => ({ type: actions.SINGLE_PAGE_DATA_ERR, err }),

  fetchPageDatasBegin: () => ({ type: actions.FETCH_PAGE_DATAS_BEGIN }),
  fetchPageDatasSuccess: (data) => ({ type: actions.FETCH_PAGE_DATAS_SUCCESS, data }),
  fetchPageDatasErr: (err) => ({ type: actions.FETCH_PAGE_DATAS_ERR, err }),

  updatePageDataBegin: () => ({ type: actions.UPDATE_PAGE_DATA_BEGIN }),
  updatePageDataSuccess: (data) => ({ type: actions.UPDATE_PAGE_DATA_SUCCESS, data }),
  updatePageDataErr: (err) => ({ type: actions.UPDATE_PAGE_DATA_ERR, err }),

  deletePageDataBegin: () => ({ type: actions.DELETE_PAGE_DATA_BEGIN }),
  deletePageDataSuccess: (id) => ({ type: actions.DELETE_PAGE_DATA_SUCCESS, id }),
  deletePageDataErr: (err) => ({ type: actions.DELETE_PAGE_DATA_ERR, err }),

  resetPageDatas: () => ({ type: actions.RESET_PAGE_DATAS }),
};

export default actions;
