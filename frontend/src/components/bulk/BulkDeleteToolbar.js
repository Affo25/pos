import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../buttons/buttons';

function BulkDeleteToolbar({ count, loading, onClick, label }) {
  if (!count) return null;

  return (
    <Button
      type="default"
      danger
      size="default"
      loading={loading}
      onClick={onClick}
      style={{ flexShrink: 0 }}
    >
      {label || `Delete selected (${count})`}
    </Button>
  );
}

BulkDeleteToolbar.propTypes = {
  count: PropTypes.number,
  loading: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default BulkDeleteToolbar;
