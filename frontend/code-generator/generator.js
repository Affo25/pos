/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
// code-generator/generator.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DEFAULT_FIELDS = ['name', 'email', 'age', 'number'];
// const API_BASE_URL = 'http://localhost:5000/api/entities';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter feature name (singular, PascalCase, e.g., "User"): ', (featureName) => {
  if (!featureName) {
    console.log('Feature name is required!');
    rl.close();
    return;
  }

  const featureNameLower = featureName.toLowerCase();
  const featureNamePlural = `${featureName}s`;
  const featureNamePluralLower = featureNamePlural.toLowerCase();

  const containerDir = path.join(__dirname, '..', 'src', 'container', featureNamePlural);
  const reduxDir = path.join(__dirname, '..', 'src', 'redux', featureNamePluralLower);

  if (!fs.existsSync(containerDir)) fs.mkdirSync(containerDir, { recursive: true });
  if (!fs.existsSync(reduxDir)) fs.mkdirSync(reduxDir, { recursive: true });

  generateCreateComponent(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, containerDir);
  generateMainComponent(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, containerDir);
  generatePageSaga(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, reduxDir);
  generatePageService(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, reduxDir);
  generatePageSlice(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, reduxDir);

  updateMenuItems(featureName, featureNamePlural, featureNameLower);
  updateRootReducers(featureName, featureNamePlural, featureNameLower, featureNamePluralLower);
  updateRootSaga(featureName, featureNamePlural, featureNameLower, featureNamePluralLower);
  updateAdminRoutes(featureName, featureNamePlural, featureNameLower);

  console.log(`✅ Successfully generated ${featureName} feature!`);
  console.log(`📁 Container: src/container/${featureNamePlural}/`);
  console.log(`📁 Redux: src/redux/${featureNamePluralLower}/`);
  rl.close();
});

// Component Generators
function generateCreateComponent(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, dir) {
  const fields = DEFAULT_FIELDS.map((field) => ({
    name: field,
    label: field.charAt(0).toUpperCase() + field.slice(1),
    type: field === 'age' || field === 'number' ? 'number' : 'text',
    required: true,
  }));

  const formItems = fields
    .map(
      (field) => `
              <Col className='mt-2' span={12}>
                <Form.Item name="${field.name}" label="${field.label}" rules={[{ required: ${field.required} }]}>
                  <Input placeholder="Enter ${field.label}" ${field.type === 'number' ? 'type="number"' : ''} />
                </Form.Item>
              </Col>`,
    )
    .join('');

  const template = `/* eslint-disable no-unused-vars */
   import React, { useState, useEffect  } from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '../../components/modals/antd-modals';
import { Button } from '../../components/buttons/buttons';
import { create${featureName}, update${featureName} } from '../../redux/${featureNamePluralLower}/${featureNameLower}Slice';
import { BasicFormWrapper } from '../../config/default/styled';

function Create${featureName}({ visible, onCancel, ${featureNameLower}, onSuccess }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      if (${featureNameLower}) {
        form.setFieldsValue({
          ${DEFAULT_FIELDS.map((field) => `${field}: ${featureNameLower}.${field}`).join(',\n          ')},
        });
      }
    }
  }, [${featureNameLower}, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const ${featureNameLower}Data = {
        ${DEFAULT_FIELDS.map((field) => `${field}: values.${field}`).join(',\n        ')},
       
      };

      if (${featureNameLower}) {
        await dispatch(update${featureName}(${featureNameLower}.id, ${featureNameLower}Data));
      } else {
        await dispatch(create${featureName}(${featureNameLower}Data));
      }

      onSuccess();
      resetForm();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.error || error.message || 'Operation failed');
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal
      type="primary"
      title={${featureNameLower} ? 'Edit ${featureName}' : 'Create ${featureName}'}
      visible={visible}
      footer={[
        <div key="1" className="${featureNameLower}-modal-footer">
          <Button size="default" type="primary" onClick={handleOk}>
            {${featureNameLower} ? 'Update' : 'Save'}
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="${featureNameLower}-modal">
        <BasicFormWrapper>
          <Form form={form} name="create${featureName}" layout="vertical">
            <Row gutter={16}>
              ${formItems}
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

Create${featureName}.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  ${featureNameLower}: propTypes.object,
  onSuccess: propTypes.func,
};

Create${featureName}.defaultProps = {
  ${featureNameLower}: null,
};

export default Create${featureName};`;

  fs.writeFileSync(path.join(dir, `Create${featureName}.js`), template);
}

function generateMainComponent(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, dir) {
  const template = `/* eslint-disable no-unused-vars */
  import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Menu, message, Dropdown, Select } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Create${featureName} from './Create${featureName}';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import ProjectLists from '../../config/default/List';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { delete${featureName}, fetchAll${featureNamePlural} } from '../../redux/${featureNamePluralLower}/${featureNameLower}Slice';
import { getComponentPermissions } from '../../config/utils/permission';

function ${featureNamePlural}() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { ${featureNamePluralLower}, loading } = useSelector((state) => state.${featureNamePluralLower});
    const { login: user } = useSelector(state => state.auth);
    const { canAdd, canEdit, canDelete } = getComponentPermissions(user, '${featureNamePlural}');
    
  const [dataSource, setDataSource] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [state, setState] = useState({
    notData: [],
    visible: false,
    categoryActive: 'all',
    selected${featureName}: null,
    selected${featureName}Id: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('category');

  const { notData, visible, selected${featureName} } = state;

  const handleEdit = (${featureNameLower}) => {
    const { _id: id, ...rest } = ${featureNameLower};

    setState({
      ...state,
      visible: true,
      selected${featureName}: {
        ...rest,
        id,
      },
    });
  };

  const handleDelete = (id) => {
    dispatch(delete${featureName}(id));
   
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      selected${featureName}: null,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      selected${featureName}: null,
    });
  };

  const handleSearch = (searchText) => {
    setSearchTerm(searchText);
  };

  useEffect(() => {
    dispatch(fetchAll${featureNamePlural}());
  }, []);

  useEffect(() => {
    if (${featureNamePluralLower} && Array.isArray(${featureNamePluralLower})) {
      let filtered = [...${featureNamePluralLower}];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (sortStatus !== 'category') {
        filtered = filtered.filter((item) => item.status.toLowerCase() === sortStatus.toLowerCase());
      }

      filtered.sort((a, b) => {
        if (searchTerm) {
          if (a.name.toLowerCase().includes(searchTerm.toLowerCase())) return -1;
          if (b.name.toLowerCase().includes(searchTerm.toLowerCase())) return 1;
        }
        return 0;
      });
      
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filtered.slice(start, end);
      
      const formatted = paginatedData.map((${featureNameLower}) => {
        const { _id, id, name, email, age, number, status } = ${featureNameLower};
        return {
          key: _id || id,
          id: _id || id,
          name,
          email,
          age,
          number,
          status:
            status === 'active' ? (
              <span className="color-success">Active</span>
            ) : (
              <span className="color-danger">Inactive</span>
            ),
          action: (
            <Dropdown
              overlay={
                <Menu className="custom-dropdown-menu">
                  <Menu.Item disabled={!canEdit} key="edit" className="custom-menu-item" onClick={() => handleEdit(${featureNameLower})}>
                    <div className="custom-action-btn edit-btn">
                      <EditOutlined className="action-icon" />
                      <span className="action-label">Edit</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item disabled={!canDelete} key="delete" className="custom-menu-item" onClick={() => handleDelete(_id || id)}>
                    <div className="custom-action-btn delete-btn">
                      <DeleteOutlined className="action-icon" />
                      <span className="action-label">Delete</span>
                    </div>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
              overlayClassName="custom-dropdown-overlay"
            >
              <Link to="#" className="text-dark dropdown-trigger">
                <FeatherIcon icon="more-horizontal" size={18} />
              </Link>
            </Dropdown>
          ),
        };
      });
      setDataSource(formatted);
    }
  }, [${featureNamePluralLower}, pagination, searchTerm, sortStatus]);

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      ...pagination,
      current: 1,
      pageSize: size,
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 50,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="${featureNamePlural}"
          subTitle={<>{loading ? 'Loading...' : \`\${dataSource.length} ${featureNamePlural}\`}</>}
          buttons={[
            <Button disabled={!canAdd} onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create ${featureName}
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-search">
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search ${featureNamePluralLower}" patterns />
                </div>
                <div className="sort-group">
                  <span style={{ display: 'flex', alignItems: 'center' }}>Sort By:</span>
                  <Select defaultValue="category" onChange={(value) => setSortStatus(value)}>
                    <Select.Option value="category">All</Select.Option>
                    <Select.Option value="Active">Active</Select.Option>
                    <Select.Option value="InActive">Inactive</Select.Option>
                  </Select>
                </div>
              </div>
            </ProjectSorting>
            <div>
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={${featureNamePluralLower}?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>
          </Col>
        </Row>
        <Create${featureName} 
          visible={visible} 
          onCancel={onCancel} 
          ${featureNameLower}={selected${featureName}}
          onSuccess={() => {
            dispatch(fetchAll${featureNamePlural}());
          }} 
        />
      </Main>
    </>
  );
}

export default ${featureNamePlural};`;

  fs.writeFileSync(path.join(dir, `${featureNamePlural}.js`), template);
}

// Redux Generators
function generatePageSaga(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, dir) {
  const template = `import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as ${featureNameLower}Service from './${featureNameLower}Service';
import {
  operationStart,
  operationSuccess,
  operationFailure,
  fetch${featureNamePlural}Success,
} from './${featureNameLower}Slice';

function* fetchAll${featureNamePlural}() {
  try {
    yield put(operationStart());
    const ${featureNamePluralLower} = yield call(${featureNameLower}Service.fetchAll${featureNamePlural});
    yield put(fetch${featureNamePlural}Success(${featureNamePluralLower}));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* create${featureName}({ payload: ${featureNameLower}Data }) {
  try {
    yield put(operationStart());
    yield call(${featureNameLower}Service.create${featureName}, ${featureNameLower}Data);
     toast.success('${featureName} created successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAll${featureNamePlural});
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
     toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* update${featureName}({ payload: { id, data } }) {
  try {
    yield put(operationStart());
    yield call(${featureNameLower}Service.update${featureName}, id, data);
    yield put(operationSuccess());
     toast.success('${featureName} updated successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAll${featureNamePlural});
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
  }
}

function* delete${featureName}({ payload: id  }) {
  try {
    yield put(operationStart());
    yield call(${featureNameLower}Service.delete${featureName}, id);
    yield put(operationSuccess());
    toast.success('${featureName} deleted successfully', {
      position: "top-right",
      autoClose: 3000,
    });
    yield call(fetchAll${featureNamePlural});
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message, {
      position: "top-right",
      autoClose: 5000,
    });
  }
}

export default function* ${featureNameLower}Saga() {
  yield all([
    takeLatest('${featureNamePluralLower}/fetchAll', fetchAll${featureNamePlural}),
    takeLatest('${featureNamePluralLower}/create', create${featureName}),
    takeLatest('${featureNamePluralLower}/update', update${featureName}),
    takeLatest('${featureNamePluralLower}/delete', delete${featureName}),
  ]);
}`;

  fs.writeFileSync(path.join(dir, `${featureNameLower}Saga.js`), template);
}

function generatePageService(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, dir) {
  const apiEndpoint = `http://localhost:5000/api/${featureNamePluralLower}`;

  const template = `import Cookies from 'js-cookie';

const API_BASE_URL = '${apiEndpoint}';
const getToken = () => Cookies.get('token');

export const fetchAll${featureNamePlural} = async () => {
  const token = getToken();
  const url = API_BASE_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: \`Bearer \${token}\`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch ${featureNamePluralLower}');
  return data;
};

export const create${featureName} = async (${featureNameLower}Data) => {
  const token = getToken();
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${token}\`,
    },
    body: JSON.stringify(${featureNameLower}Data),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create ${featureNameLower}');
  return data;
};

export const update${featureName} = async (id, ${featureNameLower}Data) => {
  const token = getToken();
  const response = await fetch(\`\${API_BASE_URL}/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${token}\`,
    },
    body: JSON.stringify(${featureNameLower}Data),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update ${featureNameLower}');
  return data;
};

export const delete${featureName} = async (id) => {
  const token = getToken();
  const response = await fetch(\`\${API_BASE_URL}/\${id}\`, {
    method: 'DELETE',
    headers: {
      Authorization: \`Bearer \${token}\`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete ${featureNameLower}');
  }

  return id;
};`;

  fs.writeFileSync(path.join(dir, `${featureNameLower}Service.js`), template);
}

function generatePageSlice(featureName, featureNamePlural, featureNameLower, featureNamePluralLower, dir) {
  const template = `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ${featureNamePluralLower}: [],
  loading: false,
  error: null,
};

const ${featureNameLower}Slice = createSlice({
  name: '${featureNamePluralLower}',
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
    fetch${featureNamePlural}Success(state, action) {
      state.${featureNamePluralLower} = action.payload;
    },
  },
});

const fetchAll${featureNamePlural} = () => ({ type: '${featureNamePluralLower}/fetchAll'});
const create${featureName} = (${featureNameLower}Data) => ({ type: '${featureNamePluralLower}/create', payload: ${featureNameLower}Data });
const update${featureName} = (id, data) => ({ type: '${featureNamePluralLower}/update', payload: { id, data } });
const delete${featureName} = (id) => ({ type: '${featureNamePluralLower}/delete',payload:  id });

export const {
  operationStart,
  operationSuccess,
  operationFailure,
  fetch${featureNamePlural}Success,
} = ${featureNameLower}Slice.actions;

export { fetchAll${featureNamePlural}, create${featureName}, update${featureName}, delete${featureName} };

export default ${featureNameLower}Slice.reducer;`;

  fs.writeFileSync(path.join(dir, `${featureNameLower}Slice.js`), template);
}

function updateMenuItems(featureName, featureNamePlural, featureNameLower) {
  const possiblePaths = [
    path.join(__dirname, '..', 'src', 'layout', 'MenuItems.js'),
    path.join(__dirname, '..', 'src', 'layout', 'MenueItems.js'),
    path.join(__dirname, '..', 'src', 'components', 'layout', 'MenuItems.js'),
    path.join(__dirname, '..', 'src', 'components', 'layout', 'MenueItems.js'),
    path.join(__dirname, '..', 'src', 'components', 'MenuItems.js'),
    path.join(__dirname, '..', 'src', 'components', 'MenueItems.js'),
  ];

  let menuItemsPath;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      menuItemsPath = possiblePath;
      break;
    }
  }

  if (!menuItemsPath) {
    console.log('⚠️ MenuItems.js not found in any known locations.');
    return;
  }

  console.log(`ℹ️ Found menu file at: ${menuItemsPath}`);

  const menuContent = fs.readFileSync(menuItemsPath, 'utf8');

  if (menuContent.includes(`key="${featureNamePlural}"`)) {
    console.log('✅ Menu item already exists. Skipping update.');
    return;
  }

  // Also need to update the menuKeys object
  if (!menuContent.includes(`${featureNamePlural.toLowerCase()}: '${featureNamePlural}'`)) {
    const menuKeysStart = menuContent.indexOf('const menuKeys = {');
    const menuKeysEnd = menuContent.indexOf('};', menuKeysStart);

    if (menuKeysStart !== -1 && menuKeysEnd !== -1) {
      const menuKeysContent = menuContent.substring(menuKeysStart, menuKeysEnd + 2);
      const lastPropertyIndex = menuKeysContent.lastIndexOf(',');

      const newMenuKey = `\n      ${featureNamePlural.toLowerCase()}: '${featureNamePlural}',`;
      const updatedMenuKeys =
        menuKeysContent.substring(0, lastPropertyIndex + 1) +
        newMenuKey +
        menuKeysContent.substring(lastPropertyIndex + 1);

      const updatedContentWithMenuKeys =
        menuContent.substring(0, menuKeysStart) + updatedMenuKeys + menuContent.substring(menuKeysEnd + 2);

      fs.writeFileSync(menuItemsPath, updatedContentWithMenuKeys);
      console.log(`✅ Added ${featureNamePlural} to menuKeys object`);
    }
  }

  const setupSubmenuStart = menuContent.indexOf('<Menu.SubMenu key="Setup"');
  if (setupSubmenuStart === -1) {
    console.log('❌ Could not find Setup submenu.');
    return;
  }

  const setupSubmenuEnd = menuContent.indexOf('</Menu.SubMenu>', setupSubmenuStart);
  if (setupSubmenuEnd === -1) {
    console.log('❌ Could not find Setup submenu closing tag.');
    return;
  }

  const setupContent = menuContent.substring(setupSubmenuStart, setupSubmenuEnd);
  const lastMenuItem = setupContent.lastIndexOf('</Menu.Item>');

  if (lastMenuItem === -1) {
    console.log('❌ Could not find menu items in Setup submenu.');
    return;
  }

  const insertPosition = setupSubmenuStart + lastMenuItem + '</Menu.Item>'.length;

  const menuItem = `
          {canAccess('${featureNameLower}') && (
            <Menu.Item key="${featureNamePlural}">
              <NavLink onClick={toggleCollapsed} to={\`\${path}${featureNamePlural.toLowerCase()}\`}>
                ${featureNamePlural}
              </NavLink>
            </Menu.Item>
          )}`;

  const updatedMenuContent =
    menuContent.substring(0, insertPosition) + menuItem + menuContent.substring(insertPosition);

  fs.writeFileSync(menuItemsPath, updatedMenuContent);
  console.log(`✅ Added ${featureNamePlural} menu item under Setup submenu`);
}

function updateRootReducers(featureName, featureNamePlural, featureNameLower) {
  const rootReducersPath = path.join(__dirname, '..', 'src', 'redux', 'rootReducers.js');
  if (!fs.existsSync(rootReducersPath)) {
    console.log('⚠️ rootReducers.js not found. Skipping update.');
    return;
  }

  let content = fs.readFileSync(rootReducersPath, 'utf8');

  const importStatement = `import ${featureNameLower}Reducer from './${featureNamePlural.toLowerCase()}/${featureNameLower}Slice'`;
  if (!content.includes(importStatement)) {
    const lastImportIndex = content.lastIndexOf('import');
    content = `${content.slice(0, lastImportIndex)}${importStatement};\n${content.slice(lastImportIndex)}`;
  }

  const reducerKey = featureNamePlural.toLowerCase();
  const reducerEntry = `${reducerKey}: ${featureNameLower}Reducer`;

  if (!content.includes(reducerEntry)) {
    const combineReducersStart = content.indexOf('combineReducers({');
    const combineReducersEnd = content.indexOf('});', combineReducersStart);

    const insertionPoint =
      combineReducersStart + content.slice(combineReducersStart, combineReducersEnd).lastIndexOf(',') + 1;
    content = `${content.slice(0, insertionPoint)}\n  ${reducerEntry},${content.slice(insertionPoint)}`;
  }

  fs.writeFileSync(rootReducersPath, content);
  console.log(`✅ Added ${reducerEntry} to root reducers`);
}

function updateRootSaga(featureName, featureNamePlural, featureNameLower, featureNamePluralLower) {
  const rootSagaPath = path.join(__dirname, '..', 'src', 'redux', 'rootSaga.js');
  if (!fs.existsSync(rootSagaPath)) {
    console.log('⚠️ rootSaga.js not found. Skipping update.');
    return;
  }

  const sagaContent = fs.readFileSync(rootSagaPath, 'utf8');

  if (sagaContent.includes(`${featureNameLower}Saga()`)) {
    console.log('⚠️ Saga already exists in rootSaga.js. Skipping update.');
    return;
  }

  const importIndex = sagaContent.indexOf('import { all }');
  const beforeImports = sagaContent.substring(0, importIndex);
  const afterImports = sagaContent.substring(importIndex);

  const newImport = `import ${featureNameLower}Saga from './${featureNamePluralLower}/${featureNameLower}Saga';\n`;
  const updatedImports = beforeImports + newImport + afterImports;

  const sagaFunctionIndex = updatedImports.indexOf('yield all([');
  const beforeSagaFunction = updatedImports.substring(0, sagaFunctionIndex);
  const afterSagaFunction = updatedImports.substring(sagaFunctionIndex);

  const newSagaCall = `    ${featureNameLower}Saga(),\n`;
  const finalContent = afterSagaFunction.replace(/yield all\(\[([\s\S]*?)\]\);/, `yield all([\n$1${newSagaCall}]);`);

  fs.writeFileSync(rootSagaPath, beforeSagaFunction + finalContent);
}

function updateAdminRoutes(featureName, featureNamePlural, featureNameLower) {
  const adminRoutesPath = path.join(__dirname, '..', 'src', 'routes', 'admin', 'index.js');
  if (!fs.existsSync(adminRoutesPath)) {
    console.log('⚠️ admin/index.js not found. Skipping route update.');
    return;
  }

  const routesContent = fs.readFileSync(adminRoutesPath, 'utf8');

  if (routesContent.includes(`path={\`\${path}${featureNamePlural.toLowerCase()}\`}`)) {
    console.log('⚠️ Route already exists in admin/index.js. Skipping update.');
    return;
  }

  let updatedContent = routesContent;

  const lazyImportRegex = /const\s+(\w+)\s*=\s*lazy\(/;
  const lazyImportMatch = updatedContent.match(lazyImportRegex);

  if (!lazyImportMatch) {
    console.log('⚠️ Could not find lazy imports section');
    return;
  }

  const lazyImportIndex = lazyImportMatch.index;

  const newLazyImport = `const ${featureNamePlural} = lazy(() => import('../../container/${featureNamePlural}/${featureNamePlural}'));\n`;
  updatedContent = updatedContent.slice(0, lazyImportIndex) + newLazyImport + updatedContent.slice(lazyImportIndex);

  const suspenseCloseRegex = /<\/Suspense\s*>/;
  const suspenseCloseMatch = updatedContent.match(suspenseCloseRegex);

  if (!suspenseCloseMatch) {
    console.log('⚠️ Could not find </Suspense> closing tag');
    return;
  }

  const suspenseCloseIndex = suspenseCloseMatch.index;

  const newRoute = `\n        {canAccess('${featureNameLower}') && <Route exact path={\`\${path}${featureNamePlural.toLowerCase()}\`} component={${featureNamePlural}} />}`;

  const routesSection = updatedContent.substring(0, suspenseCloseIndex);
  const lastRouteIndex = routesSection.lastIndexOf('<Route');

  if (lastRouteIndex !== -1) {
    const insertionPoint = routesSection.lastIndexOf('</Route>', lastRouteIndex);
    if (insertionPoint !== -1) {
      updatedContent =
        updatedContent.slice(0, insertionPoint + 8) + newRoute + updatedContent.slice(insertionPoint + 8);
    } else {
      updatedContent =
        updatedContent.slice(0, suspenseCloseIndex) + newRoute + updatedContent.slice(suspenseCloseIndex);
    }
  } else {
    updatedContent = updatedContent.slice(0, suspenseCloseIndex) + newRoute + updatedContent.slice(suspenseCloseIndex);
  }

  fs.writeFileSync(adminRoutesPath, updatedContent);
  console.log(`✅ Added ${featureNamePlural} route with lazy loading`);
}
