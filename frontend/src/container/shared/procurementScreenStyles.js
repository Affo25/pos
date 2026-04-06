import styled from 'styled-components';

/** Shared layout for Purchase Orders & Suppliers list screens */
export const ScreenWrap = styled.div`
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;

  .page-hero {
    margin-bottom: 20px;
    padding: 22px 26px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 48%, #f0fdfa 100%);
    border: 1px solid rgba(139, 92, 246, 0.12);
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    position: relative;
    overflow: hidden;
  }

  .page-hero::after {
    content: '';
    position: absolute;
    top: -30px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.09) 0%, transparent 70%);
    pointer-events: none;
  }

  .page-hero-inner {
    position: relative;
    z-index: 1;
  }

  .page-title {
    margin: 0 0 6px;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
    line-height: 1.2;
  }

  .page-sub {
    margin: 0;
    font-size: 16px;
    color: #64748b;
    font-weight: 500;
  }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .kpi-tile {
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .kpi-tile:hover {
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  .kpi-label {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .kpi-value {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .kpi-hint {
    margin-top: 4px;
    font-size: 13px;
    color: #94a3b8;
  }

  /* Match .page-hero: same gradient strip for search + filters */
  .toolbar-card {
    background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 48%, #f0fdfa 100%);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 16px;
    padding: 18px 22px;
    margin-bottom: 16px;
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    position: relative;
    overflow: hidden;
  }

  .toolbar-card::after {
    content: '';
    position: absolute;
    top: -30px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.09) 0%, transparent 70%);
    pointer-events: none;
  }

  .toolbar-card > * {
    position: relative;
    z-index: 1;
  }

  .toolbar-card .project-sort-bar {
    align-items: center;
  }

  .toolbar-card .project-sort-search .ant-input,
  .toolbar-card .project-sort-search input {
    font-size: 15px !important;
    min-height: 40px !important;
  }

  .toolbar-card .sort-group span {
    font-size: 15px !important;
    font-weight: 600;
    color: #475569;
  }

  .toolbar-card .ant-select-selector {
    font-size: 15px !important;
    min-height: 40px !important;
    padding-top: 4px !important;
  }

  .toolbar-card .ant-input-affix-wrapper-lg .ant-input,
  .toolbar-card .ant-input-affix-wrapper .ant-input {
    font-size: 15px !important;
  }

  .toolbar-card .ant-input-affix-wrapper {
    min-height: 40px !important;
    padding: 6px 11px !important;
    font-size: 15px !important;
  }

  .toolbar-section-label {
    font-size: 17px !important;
    font-weight: 700 !important;
    color: #0f172a !important;
    letter-spacing: -0.02em;
  }

  .list-screen-tabs .ant-tabs-tab {
    font-size: 15px !important;
    font-weight: 600 !important;
    padding: 12px 18px !important;
  }

  .list-screen-tabs .ant-tabs-tab-btn {
    font-size: 15px !important;
  }

  .list-screen-tabs .ant-radio-button-wrapper {
    font-size: 14px !important;
    padding: 6px 12px !important;
    height: auto !important;
    line-height: 1.4 !important;
  }

  .table-shell {
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  }

  .table-shell .table-responsive {
    overflow-x: auto;
  }

  .table-shell .ant-table {
    font-size: 15px !important;
  }

  .table-shell .ant-table-thead > tr > th {
    font-size: 13px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.05em !important;
    color: #64748b !important;
    background: #f8fafc !important;
    padding: 14px 16px !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .table-shell .ant-table-tbody > tr > td {
    padding: 14px 16px !important;
    color: #334155 !important;
    border-bottom: 1px solid #f1f5f9 !important;
  }

  .table-shell .ant-table-tbody > tr:hover > td {
    background: #fafafa !important;
  }

  .table-shell .ant-pagination {
    padding: 16px 18px !important;
    margin: 0 !important;
    border-top: 1px solid #f1f5f9;
    font-size: 14px;
  }

  .table-shell .ant-pagination-item,
  .table-shell .ant-pagination-prev .ant-pagination-item-link,
  .table-shell .ant-pagination-next .ant-pagination-item-link {
    font-size: 14px;
  }

  .ant-page-header-heading-title .page-title {
    display: inline-block;
  }

  .ant-page-header-heading-sub-title .page-sub {
    display: inline-block;
  }
`;

/** Larger labels and controls for create / edit modals */
export const ProcurementFormStyles = styled.div`
  .ant-form-item-label > label {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #334155 !important;
  }

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector,
  .ant-picker,
  .ant-input-number {
    font-size: 15px !important;
    min-height: 42px !important;
    border-radius: 10px !important;
  }

  .ant-input-number-input {
    height: 40px !important;
    font-size: 15px !important;
  }

  .ant-select-selection-item {
    line-height: 40px !important;
  }

  .section-heading {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin: 8px 0 16px;
    letter-spacing: -0.02em;
  }

  .ant-divider {
    border-color: #e2e8f0 !important;
  }
`;
