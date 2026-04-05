import Styled from 'styled-components';

/* Page width wrapper — canvas bg comes from layout .app-shell-content */
export const DashboardPage = Styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px 0 8px;
  width: 100%;
`;

export const KpiGrid = Styled.div`
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
`;

export const KpiCard = Styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 18px 18px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  min-height: 118px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  }
`;

export const KpiMain = Styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const KpiValue = Styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

export const KpiLabel = Styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
  font-weight: 500;
`;

export const KpiTrend = Styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.$up ? '#16a34a' : '#dc2626')};
`;

export const KpiTrendMuted = Styled.div`
  margin-top: 10px;
  font-size: 11px;
  color: #9ca3af;
`;

export const KpiSparkWrap = Styled.div`
  width: 88px;
  flex-shrink: 0;
  align-self: center;
  height: 56px;
`;

export const RevenueCard = Styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  overflow: hidden;
`;

export const RevenueHead = Styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
`;

export const RevenueTitle = Styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

export const RevenueMetrics = Styled.div`
  display: flex;
  gap: 24px;
  padding: 14px 18px 8px;
  flex-wrap: wrap;
`;

export const MetricBlock = Styled.div``;

export const MetricLabel = Styled.div`
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
`;

export const MetricValue = Styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => p.$muted ? '#9ca3af' : '#5f63f2'};
`;

export const ChartPane = Styled.div`
  padding: 8px 8px 16px;
  min-height: 300px;
`;

export const SideTableCard = Styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 420px;
`;

export const SideTableHead = Styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

export const SideTableBody = Styled.div`
  padding: 0 8px 12px;
  flex: 1;
`;

export const TableCard = Styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  padding: 0 0 8px;
  margin-top: 16px;
`;

export const TableCardHead = Styled.div`
  padding: 16px 18px 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;
