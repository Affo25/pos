/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Select, Space, Spin, Alert, message, Button as AntdButton } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import propTypes from 'prop-types';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import ModernModalStyles from '../shared/modalStyles';
import { API_BASE } from '../../config/apiBase';
import { INVOICE_PDF_TEMPLATE, SALE_RETURN_DOCUMENT_TITLE } from '../../utils/invoiceTemplates';
import { createPdfObjectUrl, fetchInvoicePdfBlob, saveInvoicePdfFromPreview } from '../../utils/invoicePdfPreview';
import { buildSaleReturnInvoice, printInvoicePayload } from '../../utils/invoicePrintPayload';
import PdfPreviewFrame from '../../components/pdf/PdfPreviewFrame';
import { deferTask } from '../../utils/deferTask';

function SaleReturnPreviewModal({ visible, onCancel, sale, returnRecords, returnReason }) {
  const { customers } = useSelector((state) => state.customers);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [printersLoading, setPrintersLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(
    () => localStorage.getItem('pos_printer') || undefined,
  );
  const reqId = useRef(0);
  const token = Cookies.get('token');

  const closeAndRevoke = useCallback(() => {
    reqId.current += 1;
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPdfLoading(false);
    setPdfError(null);
    onCancel?.();
  }, [onCancel]);

  const getInvoicePayload = useCallback(
    () => buildSaleReturnInvoice(sale, returnRecords, customers, returnReason),
    [sale, returnRecords, customers, returnReason],
  );

  const loadPreview = useCallback(async () => {
    if (!sale || !returnRecords?.length) return;
    const req = ++reqId.current;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const invoice = getInvoicePayload();
      if (!invoice) throw new Error('Could not build return invoice');
      const blob = await fetchInvoicePdfBlob(invoice, INVOICE_PDF_TEMPLATE, token);
      if (reqId.current !== req) return;
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return createPdfObjectUrl(blob);
      });
    } catch (e) {
      if (reqId.current === req) {
        setPdfError(e.message || 'Could not load PDF');
      }
    } finally {
      if (reqId.current === req) setPdfLoading(false);
    }
  }, [sale, returnRecords, getInvoicePayload, token]);

  useEffect(() => {
    if (!visible || !sale || !returnRecords?.length) {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    deferTask(() => loadPreview());
  }, [visible, sale, returnRecords, loadPreview]);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    setPrintersLoading(true);
    fetch(`${API_BASE}/print/printers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.printers) return;
        setPrinters(data.printers);
        const saved = localStorage.getItem('pos_printer');
        if (saved && data.printers.some((p) => p.name === saved)) {
          setSelectedPrinter(saved);
        }
      })
      .finally(() => {
        if (!cancelled) setPrintersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, token]);

  const handlePrint = async () => {
    const printer = selectedPrinter || localStorage.getItem('pos_printer');
    if (!printer) {
      message.warning('Select a printer');
      return;
    }
    localStorage.setItem('pos_printer', printer);
    const invoice = getInvoicePayload();
    if (!invoice) return;
    setPrinting(true);
    try {
      await printInvoicePayload(invoice, token, 'pos_printer');
      message.success(`Sent to ${printer}`);
    } catch (e) {
      message.error(e.message || 'Print failed');
    } finally {
      setPrinting(false);
    }
  };

  const handleSavePdf = async () => {
    const origNo = sale?.invoice_no || 'sale-return';
    const retId = String(returnRecords?.[0]?._id || '').slice(-6);
    const filename = `${origNo}-return-${retId || 'note'}`;
    try {
      const invoice = getInvoicePayload();
      await saveInvoicePdfFromPreview({
        objectUrl: pdfUrl,
        invoice,
        template: INVOICE_PDF_TEMPLATE,
        token,
        filename,
      });
      message.success('PDF saved to your downloads');
    } catch (e) {
      message.error(e?.message || 'Could not save PDF');
    }
  };

  const invoiceNo =
    sale?.invoice_no ||
    (typeof sale?.invoice_no === 'string' ? sale.invoice_no : null) ||
    'Sale';

  return (
    <>
      <ModernModalStyles />
      <Modal
        className="modern-modal"
        title={
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>
            {SALE_RETURN_DOCUMENT_TITLE} · {invoiceNo}
          </span>
        }
        open={visible}
        onCancel={closeAndRevoke}
        width={980}
        centered
        destroyOnClose
        bodyStyle={{ padding: 0 }}
        footer={
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Select
              showSearch
              placeholder="Select printer"
              style={{ minWidth: 260, maxWidth: '100%' }}
              value={selectedPrinter}
              loading={printersLoading}
              optionFilterProp="children"
              onChange={(v) => {
                setSelectedPrinter(v);
                localStorage.setItem('pos_printer', v);
              }}
            >
              {printers.map((p) => (
                <Select.Option key={p.name} value={p.name}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
            <Space>
              <AntdButton onClick={closeAndRevoke}>Cancel</AntdButton>
              <AntdButton icon={<DownloadOutlined />} disabled={pdfLoading} onClick={handleSavePdf}>
                Save PDF
              </AntdButton>
              <AntdButton
                type="primary"
                icon={<PrinterOutlined />}
                loading={printing}
                disabled={pdfLoading}
                onClick={handlePrint}
              >
                Print
              </AntdButton>
            </Space>
          </div>
        }
      >
        <div style={{ background: '#f1f5f9', minHeight: 480, position: 'relative' }}>
          {pdfError && (
            <Alert type="error" showIcon message="Could not load PDF" description={pdfError} style={{ margin: 12 }} />
          )}
          {pdfUrl ? (
            <PdfPreviewFrame url={pdfUrl} title={SALE_RETURN_DOCUMENT_TITLE} />
          ) : (
            !pdfError &&
            !pdfLoading && (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b', minHeight: 480 }}>
                PDF preview will appear here.
              </div>
            )
          )}
          {pdfLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(241, 245, 249, 0.88)',
                zIndex: 2,
              }}
            >
              <Spin size="large" tip={`Generating ${SALE_RETURN_DOCUMENT_TITLE}…`} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

SaleReturnPreviewModal.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  sale: propTypes.object,
  returnRecords: propTypes.arrayOf(propTypes.object),
  returnReason: propTypes.string,
};

SaleReturnPreviewModal.defaultProps = {
  sale: null,
  returnRecords: [],
  returnReason: '',
};

export default SaleReturnPreviewModal;
