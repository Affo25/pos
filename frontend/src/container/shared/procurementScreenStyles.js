import styled from 'styled-components';

export const ScreenWrap = styled.div`
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;

  .page-hero {
    margin-bottom: 20px;
    padding: 22px 26px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #E5E7EB;
    position: relative;
    overflow: hidden;
  }

  .page-hero::after {
    display: none;
  }

  .page-hero-inner {
    position: relative;
    z-index: 1;
  }

  .page-title {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #2D3142;
    line-height: 1.2;
  }

  .page-sub {
    margin: 0;
    font-size: 14px;
    color: #9CA3AF;
    font-weight: 500;
  }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
    @media (max-width: 1199px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 575px) {
      grid-template-columns: 1fr;
    }
  }

  .kpi-tile {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px 20px 16px;
    transition: box-shadow 0.2s ease;
  }

  .kpi-tile:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .kpi-label {
    font-size: 11px;
    font-weight: 600;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .kpi-value {
    font-size: 20px;
    font-weight: 700;
    color: #2D3142;
    letter-spacing: -0.02em;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  .kpi-hint {
    margin-top: 2px;
    font-size: 11px;
    color: #9CA3AF;
  }

  .toolbar-card {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }

  .toolbar-card::after {
    display: none;
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
    font-size: 14px !important;
    min-height: 40px !important;
    border-radius: 8px !important;
    border-color: #E5E7EB !important;
  }

  .toolbar-card .sort-group span {
    font-size: 14px !important;
    font-weight: 600;
    color: #4B5563;
  }

  .toolbar-card .ant-select-selector {
    font-size: 14px !important;
    min-height: 40px !important;
    padding-top: 4px !important;
    border-radius: 8px !important;
    border-color: #E5E7EB !important;
  }

  .toolbar-card .ant-input-affix-wrapper-lg .ant-input,
  .toolbar-card .ant-input-affix-wrapper .ant-input {
    font-size: 14px !important;
  }

  .toolbar-card .ant-input-affix-wrapper {
    min-height: 40px !important;
    padding: 6px 11px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
    border-color: #E5E7EB !important;
  }

  .toolbar-section-label {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: #2D3142 !important;
    letter-spacing: -0.01em;
  }

  .list-screen-tabs .ant-tabs-tab {
    font-size: 14px !important;
    font-weight: 600 !important;
    padding: 10px 16px !important;
  }

  .list-screen-tabs .ant-tabs-tab-btn {
    font-size: 14px !important;
  }

  .list-screen-tabs .ant-radio-button-wrapper {
    font-size: 14px !important;
    padding: 6px 12px !important;
    height: auto !important;
    line-height: 1.4 !important;
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #E5E7EB;
    flex-wrap: nowrap;

    @media (max-width: 575px) {
      flex-wrap: wrap;
    }
  }

  .table-toolbar__search {
    flex: 0 0 280px;
    width: 280px;

    .ant-select-auto-complete {
      width: 100% !important;
      display: block !important;
    }

    .ant-select-selector {
      height: 40px !important;
      border-radius: 8px !important;
      border: 1px solid #D1D5DB !important;
      font-size: 14px !important;
      background: #ffffff !important;
    }

    .ant-input-affix-wrapper {
      height: 40px !important;
      border-radius: 8px !important;
      border: 1px solid #D1D5DB !important;
      font-size: 14px !important;
      background: #ffffff !important;
    }

    .ant-input-affix-wrapper:hover,
    .ant-select-selector:hover {
      border-color: #9CA3AF !important;
    }

    .ant-input-affix-wrapper:focus,
    .ant-input-affix-wrapper-focused {
      border-color: #EF8354 !important;
      box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
    }

    @media (max-width: 575px) {
      flex: 1 1 100%;
      width: 100%;
    }
  }

  .table-toolbar__filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    .ant-select {
      min-width: 130px;
    }

    .ant-select-selector {
      height: 40px !important;
      border-radius: 8px !important;
      border: 1px solid #D1D5DB !important;
      font-size: 14px !important;
      padding: 4px 11px !important;
      background: #ffffff !important;
    }

    .ant-select-selector:hover {
      border-color: #9CA3AF !important;
    }

    .ant-select-focused .ant-select-selector {
      border-color: #EF8354 !important;
      box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
    }

    .ant-select-selection-item {
      line-height: 32px !important;
    }
  }

  .table-toolbar__label {
    font-size: 14px;
    font-weight: 600;
    color: #4B5563;
    white-space: nowrap;
  }

  .table-shell {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    overflow: hidden;
  }

  .table-shell .table-responsive {
    overflow-x: auto;
  }

  .table-shell .ant-table {
    font-size: 14px !important;
  }

  .table-shell .ant-table-thead > tr > th {
    font-size: 12px !important;
    font-weight: 600 !important;
    text-transform: uppercase;
    letter-spacing: 0.05em !important;
    color: #9CA3AF !important;
    background: #F9FAFB !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid #E5E7EB !important;
  }

  .table-shell .ant-table-tbody > tr > td {
    padding: 12px 16px !important;
    color: #2D3142 !important;
    border-bottom: 1px solid #F3F4F6 !important;
    font-size: 14px;
  }

  .table-shell .ant-table-tbody > tr:hover > td {
    background: #F9FAFB !important;
  }

  .table-shell .ant-table-tbody > tr:last-child > td {
    border-bottom: none !important;
  }

  .table-shell .ant-pagination {
    padding: 14px 18px !important;
    margin: 0 !important;
    border-top: 1px solid #F3F4F6;
    font-size: 14px;
  }

  .table-shell .ant-pagination-item,
  .table-shell .ant-pagination-prev .ant-pagination-item-link,
  .table-shell .ant-pagination-next .ant-pagination-item-link {
    font-size: 14px;
    border-color: #E5E7EB;
    border-radius: 6px;
  }

  .table-shell .ant-pagination-item-active {
    background: #2D3142 !important;
    border-color: #2D3142 !important;
    a {
      color: #ffffff !important;
    }
  }

  .ant-page-header-heading-title .page-title {
    display: inline-block;
  }

  .ant-page-header-heading-sub-title .page-sub {
    display: inline-block;
  }
`;

export const ProcurementFormStyles = styled.div`
  .ant-form-item-label > label {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #4B5563 !important;
  }

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector,
  .ant-picker,
  .ant-input-number {
    font-size: 14px !important;
    min-height: 42px !important;
    border-radius: 8px !important;
    border-color: #E5E7EB !important;
  }

  .ant-input-number-input {
    height: 40px !important;
    font-size: 14px !important;
  }

  .ant-select-selection-item {
    line-height: 40px !important;
  }

  .section-heading {
    font-size: 16px;
    font-weight: 700;
    color: #2D3142;
    margin: 8px 0 16px;
    letter-spacing: -0.01em;
  }

  .ant-divider {
    border-color: #E5E7EB !important;
  }
`;
