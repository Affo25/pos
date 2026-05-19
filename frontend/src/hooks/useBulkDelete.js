import { useState, useMemo, useCallback } from 'react';
import { Modal, message } from 'antd';

const BATCH_SIZE = 8;

/**
 * Row selection + bulk delete (Products-style).
 * @param {object} options
 * @param {(id: string) => Promise<void>} options.deleteOne - API delete for one id
 * @param {() => void | Promise<void>} [options.onSuccess] - refetch list after bulk op
 * @param {string} [options.entityName] - singular label, e.g. 'product'
 * @param {string} [options.confirmTitle]
 * @param {(count: number) => string} [options.confirmContent]
 * @param {(count: number) => string} [options.successMessage]
 * @param {(record: object) => { disabled?: boolean }} [options.getCheckboxProps]
 */
export function useBulkDelete({
  deleteOne,
  onSuccess,
  entityName = 'record',
  confirmTitle,
  confirmContent,
  successMessage,
  getCheckboxProps,
}) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const removeFromSelection = useCallback((id) => {
    setSelectedRowKeys((keys) => keys.filter((k) => String(k) !== String(id)));
  }, []);

  const rowSelection = useMemo(() => {
    const base = {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      preserveSelectedRowKeys: true,
      columnWidth: 48,
    };
    if (getCheckboxProps) {
      base.getCheckboxProps = getCheckboxProps;
    }
    return base;
  }, [selectedRowKeys, getCheckboxProps]);

  const handleBulkDelete = useCallback(() => {
    const count = selectedRowKeys.length;
    if (!count || !deleteOne) return;

    Modal.confirm({
      title: confirmTitle || `Delete selected ${entityName}s?`,
      content:
        typeof confirmContent === 'function'
          ? confirmContent(count)
          : `This will permanently delete ${count} ${entityName}(s). This cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        const ids = [...selectedRowKeys];
        setBulkDeleting(true);
        let failed = 0;
        try {
          for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const slice = ids.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(slice.map((id) => deleteOne(id)));
            results.forEach((r) => {
              if (r.status === 'rejected') failed += 1;
            });
          }
          setSelectedRowKeys([]);
          if (onSuccess) await onSuccess();
          if (failed) {
            message.warning(`${ids.length - failed} deleted, ${failed} failed.`);
          } else {
            const msg =
              typeof successMessage === 'function'
                ? successMessage(ids.length)
                : `Deleted ${ids.length} ${entityName}(s).`;
            message.success(msg);
          }
        } catch (e) {
          message.error(e.message || 'Bulk delete failed');
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  }, [
    selectedRowKeys,
    deleteOne,
    onSuccess,
    entityName,
    confirmTitle,
    confirmContent,
    successMessage,
  ]);

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    bulkDeleting,
    rowSelection,
    handleBulkDelete,
    removeFromSelection,
  };
}

export default useBulkDelete;
