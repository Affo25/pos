import { Button, Modal } from 'antd';
import PropTypes from 'prop-types';

function Delete({ visible, onConfirm, onCancel }) {
  return (
    <Modal
      type="primary"
      title="Confirm Deletion"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" size="default" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="delete" type="danger" size="default" onClick={onConfirm}>
          Delete
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete this page?</p>
    </Modal>
  );
}

Delete.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default Delete;
