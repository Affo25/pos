/* eslint-disable no-underscore-dangle */
import { Modal, Input, Table, Button, Card } from 'antd';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function SelectableTableModal({
    title,
    data = [],
    columns = [],
    searchKey = 'name',
    addButtonText = 'Add Item',
    onChange,
    value = [],
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [mainTableData, setMainTableData] = useState([]);

    useEffect(() => {
        if (value?.length && data?.length) {
            const selectedRecords = data.filter((item) => value.includes(item._id));
            setMainTableData(selectedRecords);
        }
    }, [value, data]);

    useEffect(() => {
        if (onChange) {
            onChange(mainTableData.map(item => item._id));
        }
    }, [mainTableData, onChange]);

    const filteredData =
        search.trim() === ''
            ? []
            : data.filter((item) =>
                (item[searchKey] || '')
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );

    const modalColumns = [
        ...columns,
        {
            title: 'Action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        if (!mainTableData.some((item) => item._id === record._id)) {
                            setMainTableData((prev) => [...prev, record]);
                        }
                        setIsModalOpen(false);
                    }}
                >
                    Select
                </Button>
            ),
        },
    ];

    const mainColumns = [
        ...columns,
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    danger
                    type="link"
                    onClick={() => {
                        setMainTableData((prev) =>
                            prev.filter((item) => item._id !== record._id)
                        );
                    }}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <>
            <Card
                title={title}
                extra={
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        {addButtonText}
                    </Button>
                }
            >
                <Table
                    rowKey="_id"
                    columns={mainColumns}
                    dataSource={mainTableData}
                    pagination={false}
                />
            </Card>

            <Modal
                title={`Select ${title}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="70%"
            >
                <Input
                    placeholder={`Search by ${searchKey}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ marginBottom: 10 }}
                />
                <Table
                    rowKey="_id"
                    columns={modalColumns}
                    dataSource={filteredData}
                    pagination={false}
                    scroll={{ y: 'calc(80vh - 120px)' }}
                />
            </Modal>
        </>
    );
}

SelectableTableModal.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    searchKey: PropTypes.string,
    addButtonText: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.array,
};

export default SelectableTableModal;
