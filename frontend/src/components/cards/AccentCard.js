import styled from 'styled-components';
import { Card } from 'antd';

/**
 * Compact card with a left accent stripe — use across dashboard / lists / KPI rows.
 * $accent: CSS color for the left border (default theme primary).
 * $variant: stat | toolbar | section | kpi — controls padding density.
 */
const AccentCard = styled(Card).attrs((p) => ({
  size: p.size ?? 'small',
}))`
  border-radius: 10px !important;
  border: 1px solid rgba(15, 23, 42, 0.07) !important;
  border-left: 3px solid ${(p) => p.$accent || '#5F63F2'} !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
  background: #fff !important;
  transition: box-shadow 0.2s ease;

  .ant-card-body {
    padding: ${(p) => {
      switch (p.$variant) {
        case 'stat':
          return '10px 12px';
        case 'toolbar':
          return '10px 14px';
        case 'section':
          return '14px 16px';
        case 'kpi':
          return '12px 14px';
        default:
          return '12px 14px';
      }
    }} !important;
  }

  ${(p) =>
    p.$variant === 'stat'
      ? `
    .ant-statistic-title {
      font-size: 12px !important;
      margin-bottom: 2px !important;
      color: rgba(0, 0, 0, 0.55) !important;
    }
    .ant-statistic-content {
      font-size: 17px !important;
      line-height: 1.25 !important;
    }
    .ant-statistic-content-prefix {
      margin-right: 6px;
      opacity: 0.88;
      font-size: 15px !important;
    }
  `
      : ''}

  .ant-card-head {
    min-height: 36px;
    padding: 0 14px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: linear-gradient(180deg, #f8f9fb 0%, #fff 100%);
  }

  .ant-card-head-title {
    padding: 8px 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.82);
  }

  &:hover {
    box-shadow: 0 3px 14px rgba(15, 23, 42, 0.08) !important;
  }
`;

export default AccentCard;
