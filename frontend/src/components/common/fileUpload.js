// components/common/FileUpload.js
import React from 'react';
import { Upload, message } from 'antd';
import { PaperClipOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { Button } from '../buttons/buttons';

const FileUpload = ({
    value = [],
    onChange,
    maxCount = 1,
    multiple = false,
    allowedTypes = [
        'image/png',
        'image/jpeg',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ],
    maxSizeMB = 5,
    buttonText = 'Select File',
}) => {
    return (
        <Upload
            fileList={value}
            listType="text"
            multiple={multiple}
            beforeUpload={(file) => {
                const isAllowed = allowedTypes.includes(file.type);
                const isLtSize = file.size / 1024 / 1024 < maxSizeMB;

                if (!isAllowed) {
                    message.error(`File type not allowed!`);
                    return Upload.LIST_IGNORE;
                }
                if (!isLtSize) {
                    message.error(`File must be smaller than ${maxSizeMB}MB!`);
                    return Upload.LIST_IGNORE;
                }
                return false; // prevent auto-upload
            }}
            maxCount={maxCount}
            onChange={({ fileList }) => onChange(fileList)}
            itemRender={(originNode, file, fileList, actions) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        background: '#fafafa',
                        marginBottom: '6px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PaperClipOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        <span style={{ color: 'gray', fontSize: '12px' }}>
                            ({file.type ? file.type.split('/').pop() : file.name.split('.').pop()})
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <EyeOutlined
                            style={{ color: '#1890ff', cursor: 'pointer', fontSize: '16px' }}
                            onClick={() => {
                                if (file.url) {
                                    window.open(file.url, '_blank');
                                } else {
                                    const fileURL = URL.createObjectURL(file.originFileObj);
                                    window.open(fileURL, '_blank');
                                }
                            }}
                        />
                        <DeleteOutlined
                            style={{ color: 'red', cursor: 'pointer', fontSize: '16px' }}
                            onClick={() => actions.remove()}
                        />
                    </div>
                </div>
            )}
        >
            <Button type="dashed" block>
                <PaperClipOutlined style={{ marginRight: 6 }} />
                {buttonText}
            </Button>
        </Upload>
    );
};

FileUpload.propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    maxCount: PropTypes.number,
    multiple: PropTypes.bool,
    allowedTypes: PropTypes.arrayOf(PropTypes.string),
    maxSizeMB: PropTypes.number,
    buttonText: PropTypes.string,
};

FileUpload.defaultProps = {
    value: [],
    maxCount: 1,
    multiple: false,
    allowedTypes: [
        'image/png',
        'image/jpeg',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ],
    maxSizeMB: 5,
    buttonText: 'Select File',
};

export default FileUpload;
