import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const PREVIEW_HEIGHT_PX = 640;

/**
 * Full A4 PDF preview — fixed height to avoid ResizeObserver loops in modals.
 */
function PdfPreviewFrame({ url, title }) {
  const wrapStyle = useMemo(
    () => ({
      width: '100%',
      height: PREVIEW_HEIGHT_PX,
      overflow: 'hidden',
      background: '#525659',
      contain: 'layout style paint',
    }),
    [],
  );

  const frameStyle = useMemo(
    () => ({
      width: '100%',
      height: PREVIEW_HEIGHT_PX,
      border: 'none',
      display: 'block',
    }),
    [],
  );

  if (!url) return null;

  return (
    <div style={wrapStyle}>
      <iframe
        title={title}
        src={`${url}#view=FitH&toolbar=0&navpanes=0`}
        style={frameStyle}
      />
    </div>
  );
}

PdfPreviewFrame.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
};

PdfPreviewFrame.defaultProps = {
  url: null,
  title: 'Invoice PDF',
};

export default PdfPreviewFrame;
