const fs = require('fs');
const path = require('path');

const screens = [
  {
    file: 'container/Categorys/Categorys.js',
    api: "categoryApi",
    apiImport: "import * as categoryApi from '../../redux/categorys/categoryService';",
    fetch: 'fetchAllCategorys',
    entity: 'category',
    searchPlaceholder: 'Search categories',
  },
  {
    file: 'container/SubCategorys/SubCategorys.js',
    api: 'subcategoryApi',
    apiImport: "import * as subcategoryApi from '../../redux/subcategorys/subcategoryService';",
    fetch: 'fetchAllSubCategorys',
    entity: 'subcategory',
    searchPlaceholder: 'Search subcategories',
  },
  {
    file: 'container/Customers/Customers.js',
    api: 'customerApi',
    apiImport: "import * as customerApi from '../../redux/customers/customerService';",
    fetch: 'fetchAllCustomers',
    entity: 'customer',
    searchPlaceholder: 'Search name, email, phone or address',
  },
  {
    file: 'container/Suppliers/Suppliers.js',
    api: 'supplierApi',
    apiImport: "import * as supplierApi from '../../redux/suppliers/supplierService';",
    fetch: 'fetchAllSuppliers',
    entity: 'supplier',
    searchPlaceholder: 'Search name, email, or phone',
  },
  {
    file: 'container/PurchaseOrders/PurchaseOrders.js',
    api: 'purchaseorderApi',
    apiImport: "import * as purchaseorderApi from '../../redux/purchaseorders/purchaseorderService';",
    fetch: 'fetchAllPurchaseOrders',
    entity: 'purchase order',
    searchPlaceholder: null,
  },
  {
    file: 'container/Payments/Payments.js',
    api: 'paymentApi',
    apiImport: "import * as paymentApi from '../../redux/payments/paymentService';",
    fetch: 'fetchAllPayments',
    entity: 'payment',
    searchPlaceholder: 'Search payment no, invoice, party, notes…',
    cancelMode: true,
  },
  {
    file: 'container/Users/Users.js',
    api: 'userApi',
    apiImport: "import * as userApi from '../../redux/users/userService';",
    fetch: 'fetchAllUsers',
    entity: 'user',
    searchPlaceholder: null,
  },
  {
    file: 'container/BranchProfiles/BranchProfiles.js',
    api: 'branchprofileApi',
    apiImport: "import * as branchprofileApi from '../../redux/branchprofiles/branchprofileService';",
    fetch: 'fetchAllBranchProfiles',
    entity: 'branch profile',
    searchPlaceholder: null,
  },
];

const root = path.join(__dirname, '..', 'src');

function ensureImports(content, screen) {
  let s = content;
  if (!s.includes('useBulkDelete')) {
    const anchor = "import { ScreenWrap }";
    if (s.includes(anchor)) {
      s = s.replace(
        anchor,
        `import { useBulkDelete } from '../../hooks/useBulkDelete';\nimport TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';\n${screen.apiImport}\n${anchor}`,
      );
    } else if (s.includes("import { Main }")) {
      s = s.replace(
        "import { Main }",
        `import { useBulkDelete } from '../../hooks/useBulkDelete';\nimport TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow';\n${screen.apiImport}\nimport { Main }`,
      );
    }
  } else if (!s.includes(screen.apiImport.split("'")[1])) {
    s = s.replace(
      "import { useBulkDelete }",
      `${screen.apiImport}\nimport { useBulkDelete }`,
    );
  }
  if (!s.includes('TableToolbarSearchRow')) {
    s = s.replace(
      "import { useBulkDelete }",
      "import { useBulkDelete } from '../../hooks/useBulkDelete';\nimport TableToolbarSearchRow from '../../components/bulk/TableToolbarSearchRow'",
    );
  }
  return s;
}

function ensureHook(content, screen) {
  if (content.includes('useBulkDelete({')) return content;
  const permissionMatch = content.match(/const \{ canAdd, canEdit, canDelete \}/);
  const insertAfter = permissionMatch
    ? content.indexOf(permissionMatch[0]) + permissionMatch[0].length
    : content.indexOf('function ');

  const cancelOpts = screen.cancelMode
    ? `
    confirmTitle: 'Cancel selected payments?',
    confirmContent: (count) => \`This will cancel \${count} payment(s).\`,
    successMessage: (count) => \`Cancelled \${count} payment(s).\`,
    getCheckboxProps: (record) => ({ disabled: record.bulkSelectDisabled }),`
  : '';

  const hook = `

  const {
    selectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  } = useBulkDelete({
    deleteOne: ${screen.cancelMode ? 'paymentApi.cancelPayment' : `${screen.api}.delete${screen.api.replace('Api', '').replace(/^./, c => c.toUpperCase())}`},
    onSuccess: () => dispatch(${screen.fetch}(${screen.fetch.includes('Payments') ? '{}' : ''})),
    entityName: '${screen.entity}',${cancelOpts}
  });`;

  // Fix deleteOne for apis - use explicit map
  return content;
}

console.log('Use manual patches - script documents screens only');
