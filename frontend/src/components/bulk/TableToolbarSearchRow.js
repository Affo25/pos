import React from 'react';
import PropTypes from 'prop-types';
import BulkDeleteToolbar from './BulkDeleteToolbar';

/** Search row with optional bulk-delete button (Products-style toolbar). */
function TableToolbarSearchRow({ showBulkDelete, bulkCount, bulkLoading, onBulkDelete, bulkLabel, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
      {showBulkDelete && (
        <BulkDeleteToolbar count={bulkCount} loading={bulkLoading} onClick={onBulkDelete} label={bulkLabel} />
      )}
      <div className="table-toolbar__search">
        {children}
      </div>
    </div>
  );
}

TableToolbarSearchRow.propTypes = {
  showBulkDelete: PropTypes.bool,
  bulkCount: PropTypes.number,
  bulkLoading: PropTypes.bool,
  onBulkDelete: PropTypes.func,
  bulkLabel: PropTypes.string,
  children: PropTypes.node,
};

export default TableToolbarSearchRow;
