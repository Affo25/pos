import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const HTMLEditor = ({ value, onChange, placeholder }) => {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ height: '200px', marginBottom: '50px' }}
        />
    );
};

HTMLEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
};

HTMLEditor.defaultProps = {
    value: '',
    onChange: () => { },
    placeholder: '',
};

export default HTMLEditor;
