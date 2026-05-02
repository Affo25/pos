import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Skeleton,
  Table,
  Tag,
  DatePicker,
  Button as AntdButton,
  Space,
  message,
  Tabs,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

import {
  DashboardPage,
  KpiGrid,
  KpiCard,
  KpiMain,
  KpiValue,
  KpiLabel,
  KpiTrend,
  KpiTrendMuted,
  KpiSparkWrap,
  RevenueCard,
  RevenueHead,
  RevenueTitle,
  RevenueMetrics,
  MetricBlock,
  MetricLabel,
  MetricValue,
  ChartPane,
  SideTableCard,
  SideTableHead,
  SideTableBody,
  TableCard,
  TableCardHead,
} from './dashboardStyles';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { formatPkr } from '../../config/currency';
import { exportWorkbookToExcel, exportMultiSectionPdf } from '../../utils/listExport';
import {
  fetchDashboard,
  fetchRecentActivities,
  fetchSalesChart,
  fetchTopProducts,
} from '../../redux/analytics/analyticsSlice';

const chartTooltipPkr = (value) => formatPkr(value);

/** Vertical mini bars for KPI strip — pastel fill per card */
function MiniSpark({ data, color }) {
  const bars = (data || []).map((v, i) => ({ i, v: Math.max(0, v) }));
  if (!bars.length) {
    return <div style={{ height: 56, background: 'linear-gradient(90deg,#f3f4f6,#fff)' }} />;
  }
  return (
    <ResponsiveContainer width="100%" height={56}>
      <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} maxBarSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
}
MiniSpark.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
};

/** Row trend spark (line) for top products */
function RowTrendSpark({ revenue, color }) {
  const r = Math.max(0, Number(revenue) || 0);
  const pts = [0.2, 0.45, 0.65, 0.82, 1].map((t, i) => ({
    x: i,
    y: r * t * (0.85 + (i % 3) * 0.05),
  }));
  return (
    <div style={{ width: 72, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
RowTrendSpark.propTypes = {
  revenue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
};

function Dashboard() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState(() => [
    moment().startOf('month'),
    moment().endOf('day'),
  ]);
  const [chartPeriod, setChartPeriod] = useState('month');

  const { dashboard, recentActivities, salesChart, topProducts, loading } =
    useSelector((state) => state.analytics) || {};

  const rangeParams = useMemo(() => {
    if (!dateRange?.[0] || !dateRange?.[1]) return {};
    return {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    };
  }, [dateRange]);

  const loadDashboard = useCallback(() => {
    const { startDate, endDate } = rangeParams;
    if (!startDate || !endDate) return;
    dispatch(fetchDashboard({ startDate, endDate }));
    dispatch(fetchRecentActivities(10));
    dispatch(
      fetchTopProducts({
        limit: 8,
        startDate,
        endDate,
      })
    );
    dispatch(
      fetchSalesChart({
        period: chartPeriod,
        startDate,
        endDate,
      })
    );
  }, [dispatch, rangeParams, chartPeriod]);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onChartPeriodChange = (key) => {
    setChartPeriod(key);
    const { startDate, endDate } = rangeParams;
    if (!startDate || !endDate) return;
    dispatch(
      fetchSalesChart({
        period: key,
        startDate,
        endDate,
      })
    );
  };

  const stats = dashboard?.stats;
  const extra = dashboard?.additionalStats;
  const meta = dashboard?.meta;

  const weeklyBarData = useMemo(
    () =>
      (dashboard?.salesOverview?.weekly || []).map((d) => ({
        name: d.day,
        sales: Number(d.sales ?? 0),
        count: Number(d.count ?? 0),
      })),
    [dashboard?.salesOverview?.weekly]
  );

  const areaData = useMemo(() => {
    return (salesChart || []).map((item) => ({
      name: String(item.month ?? ''),
      sales: Number(item.totalSales ?? 0),
    }));
  }, [salesChart]);

  const pctChange = stats?.todaysSales?.percentageChange;

  const areaDataWithPrevious = useMemo(() => {
    if (!areaData.length) return [];
    const sum = areaData.reduce((s, r) => s + r.sales, 0);
    const prevTotal =
      pctChange != null && Number.isFinite(pctChange) && pctChange !== -100 && sum > 0
        ? sum / (1 + pctChange / 100)
        : sum * 0.82;
    const factor = sum > 0 ? prevTotal / sum : 0.82;
    return areaData.map((r) => ({
      ...r,
      previous: Math.max(0, r.sales * factor),
    }));
  }, [areaData, pctChange]);

  const currentRevTotal = stats?.todaysSales?.value ?? 0;
  const prevRevTotal =
    pctChange != null && Number.isFinite(pctChange) && pctChange !== -100 && currentRevTotal >= 0
      ? currentRevTotal / (1 + pctChange / 100)
      : null;

  const sparkSales = useMemo(() => {
    const w = weeklyBarData.map((d) => d.sales);
    if (w.length >= 5) return w.slice(-7);
    const s = areaData.map((d) => d.sales);
    if (s.length >= 5) return s.slice(-7);
    const base = Math.max(currentRevTotal / Math.max(areaData.length || 1, 1), 1);
    return Array.from({ length: 7 }, (_, i) => base * (0.4 + ((i * 13) % 50) / 100));
  }, [weeklyBarData, areaData, currentRevTotal]);

  const sparkProducts = useMemo(() => {
    const n = Number(extra?.totalProducts) || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(1, n * (0.55 + ((i * 17) % 40) / 100)));
  }, [extra?.totalProducts]);

  const sparkLowStock = useMemo(() => {
    const n = Number(extra?.lowStockItems) || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.5 + ((i * 11) % 50) / 100)));
  }, [extra?.lowStockItems]);

  const sparkPending = useMemo(() => {
    const n = Number(extra?.pendingOrders) || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, n * (0.45 + ((i * 19) % 50) / 100)));
  }, [extra?.pendingOrders]);

  const kpiSparkColors = ['#a8e6cf', '#f9cfa8', '#c8e6c9', '#b8d4e8'];

  const handleExportExcel = () => {
    if (!dashboard && !recentActivities?.length && !topProducts?.length) {
      message.warning('Nothing to export yet');
      return;
    }
    const rangeLabel = meta?.rangeLabel
      ? `${meta.rangeLabel} (${moment(meta.rangeStart).format('ll')} – ${moment(meta.rangeEnd).format('ll')})`
      : 'Summary';

    const kpiHeaders = ['Metric', 'Value'];
    const kpiRows = [
      ['Period / month sales', stats?.todaysSales?.formattedValue ?? '—'],
      ['Total products', String(extra?.totalProducts ?? '—')],
      ['Low stock items', String(extra?.lowStockItems ?? '—')],
      ['Pending orders', String(extra?.pendingOrders ?? '—')],
      ["Today's sales (calendar)", stats?.literalToday?.formattedValue ?? '—'],
    ];

    const salesHeaders = ['Customer', 'Items', 'Qty', 'Total (PKR)', 'Date'];
    const salesRows =
      dashboard?.recentSales?.data?.map((r) => [
        r.customerName ?? '—',
        r.medicine ?? '—',
        r.quantity ?? '—',
        r.totalPrice != null ? Number(r.totalPrice).toFixed(2) : '—',
        r.date ? moment(r.date).format('YYYY-MM-DD') : '—',
      ]) ?? [];

    const topHeaders = ['Product', 'Qty sold', 'Revenue (PKR)'];
    const topRows =
      topProducts?.map((p) => [
        p.name ?? '—',
        p.totalQuantity ?? '—',
        p.totalRevenue != null ? Number(p.totalRevenue).toFixed(2) : '—',
      ]) ?? [];

    exportWorkbookToExcel({
      filename: `dashboard-${moment().format('YYYY-MM-DD')}`,
      sheets: [
        { name: 'KPIs', headers: kpiHeaders, rows: kpiRows },
        { name: 'Recent sales', headers: salesHeaders, rows: salesRows },
        { name: 'Top products', headers: topHeaders, rows: topRows },
      ],
    });
    message.success(`Excel downloaded (${rangeLabel})`);
  };

  const handleExportPdf = () => {
    if (!dashboard && !topProducts?.length) {
      message.warning('Nothing to export yet');
      return;
    }
    const rangeLabel = meta?.rangeLabel
      ? `${meta.rangeLabel} ${moment(meta.rangeStart).format('ll')} – ${moment(meta.rangeEnd).format('ll')}`
      : 'Dashboard';

    const kpiRows = [
      ['Period / month sales', stats?.todaysSales?.formattedValue ?? '—'],
      ['Total products', String(extra?.totalProducts ?? '—')],
      ['Low stock', String(extra?.lowStockItems ?? '—')],
      ['Pending orders', String(extra?.pendingOrders ?? '—')],
      ["Today's sales", stats?.literalToday?.formattedValue ?? '—'],
    ];

    const salesRows =
      dashboard?.recentSales?.data?.map((r) => [
        r.customerName ?? '—',
        (r.medicine || '').slice(0, 40),
        String(r.quantity ?? '—'),
        r.totalPrice != null ? Number(r.totalPrice).toFixed(2) : '—',
        r.date ? moment(r.date).format('YYYY-MM-DD') : '—',
      ]) ?? [];

    const topRows =
      topProducts?.map((p) => [
        (p.name || '—').slice(0, 35),
        String(p.totalQuantity ?? '—'),
        p.totalRevenue != null ? Number(p.totalRevenue).toFixed(2) : '—',
      ]) ?? [];

    exportMultiSectionPdf({
      filename: `dashboard-${moment().format('YYYY-MM-DD')}`,
      title: `Dashboard — ${rangeLabel}`,
      sections: [
        { heading: 'Key metrics', headers: ['Metric', 'Value'], rows: kpiRows },
        {
          heading: 'Recent sales (period)',
          headers: ['Customer', 'Items', 'Qty', 'Total', 'Date'],
          rows: salesRows,
        },
        {
          heading: 'Top products (period)',
          headers: ['Product', 'Qty sold', 'Revenue'],
          rows: topRows,
        },
      ],
    });
    message.success('PDF downloaded');
  };

  const recentSalesColumns = [
    { title: 'Customer', dataIndex: 'customerName', ellipsis: true },
    { title: 'Items', dataIndex: 'medicine', ellipsis: true },
    { title: 'Qty', dataIndex: 'quantity', width: 70 },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      width: 120,
      render: (v) => formatPkr(v),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 120,
      render: (d) => (d ? moment(d).format('MMM D, YYYY') : '—'),
    },
  ];

  const recentSalesRows =
    dashboard?.recentSales?.data?.map((row, i) => ({
      key: row.id || i,
      ...row,
    })) ?? [];

  const trendColors = ['#5F63F2', '#20C997', '#FAAD14', '#FF4D4F', '#8B5CF6', '#EC4899', '#0EA5E9', '#84CC16'];

  const topProductColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (_, record) => record.name || '—',
    },
    {
      title: 'Qty sold',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 110,
      render: (v) => formatPkr(v),
    },
    {
      title: 'Trend',
      key: 'trend',
      width: 88,
      render: (_, record, i) => (
        <RowTrendSpark revenue={record.totalRevenue} color={trendColors[i % trendColors.length]} />
      ),
    },
  ];

  const topProductRows =
    topProducts?.map((p, i) => ({
      key: `tp-${i}-${p.name || ''}`,
      ...p,
    })) ?? [];

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      render: (t) => <Tag>{t}</Tag>,
    },
    {
      title: 'When',
      dataIndex: 'time',
      width: 120,
      render: (t) => (t ? moment(t).fromNow() : '—'),
    },
    {
      title: 'Detail',
      key: 'detail',
      width: 120,
      render: (_, row) => {
        if (row.amount != null) return formatPkr(row.amount);
        if (row.email) return row.email;
        if (row.quantity != null) return `Qty ${row.quantity}`;
        return '—';
      },
    },
  ];

  const activityRows =
    recentActivities?.map((a, i) => ({
      key: a.id || i,
      ...a,
    })) ?? [];

  const greeting = dashboard?.welcome?.greeting;

  const renderTrend = (pct) => {
    if (pct == null || !Number.isFinite(pct)) {
      return <KpiTrendMuted>—</KpiTrendMuted>;
    }
    const up = pct >= 0;
    return (
      <KpiTrend $up={up}>
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {Math.abs(Number(pct)).toFixed(1)}% <span style={{ fontWeight: 400, color: '#9ca3af' }}>vs previous</span>
      </KpiTrend>
    );
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subTitle={
          greeting ? (
            <span style={{ color: 'rgba(0,0,0,0.55)', fontWeight: 400 }}>{greeting}</span>
          ) : (
            meta?.rangeLabel && (
              <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                {moment(meta.rangeStart).format('ll')} – {moment(meta.rangeEnd).format('ll')}
              </span>
            )
          )
        }
        buttons={[
          <Space key="range" wrap>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(v) => v && v[0] && v[1] && setDateRange(v)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
            <AntdButton type="primary" onClick={() => loadDashboard()} loading={loading}>
              Apply
            </AntdButton>
          </Space>,
          <Button key="x" outlined type="primary" size="default" onClick={handleExportExcel} disabled={loading}>
            <FileExcelOutlined style={{ marginRight: 8 }} />
            Export
          </Button>,
          <Button key="p" outlined type="primary" size="default" onClick={handleExportPdf} disabled={loading}>
            <FilePdfOutlined style={{ marginRight: 8 }} />
            PDF
          </Button>,
        ]}
      />

      <Main>
        <DashboardPage>
          <KpiGrid>
            <KpiCard>
              <KpiMain>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <>
                    <KpiValue>{stats?.todaysSales?.formattedValue ?? formatPkr(0)}</KpiValue>
                    <KpiLabel>{meta?.isCustomRange ? 'Period sales' : 'Revenue (period)'}</KpiLabel>
                    {renderTrend(pctChange)}
                  </>
                )}
              </KpiMain>
              <KpiSparkWrap>
                <MiniSpark data={sparkSales} color={kpiSparkColors[0]} />
              </KpiSparkWrap>
            </KpiCard>

            <KpiCard>
              <KpiMain>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <>
                    <KpiValue>{extra?.totalProducts ?? 0}</KpiValue>
                    <KpiLabel>Total products</KpiLabel>
                    <KpiTrendMuted>Items in your catalog</KpiTrendMuted>
                  </>
                )}
              </KpiMain>
              <KpiSparkWrap>
                <MiniSpark data={sparkProducts} color={kpiSparkColors[1]} />
              </KpiSparkWrap>
            </KpiCard>

            <KpiCard>
              <KpiMain>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <>
                    <KpiValue>{extra?.lowStockItems ?? 0}</KpiValue>
                    <KpiLabel>Low stock SKUs</KpiLabel>
                    <KpiTrendMuted>At or below minimum</KpiTrendMuted>
                  </>
                )}
              </KpiMain>
              <KpiSparkWrap>
                <MiniSpark data={sparkLowStock} color={kpiSparkColors[2]} />
              </KpiSparkWrap>
            </KpiCard>

            <KpiCard>
              <KpiMain>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <>
                    <KpiValue>{extra?.pendingOrders ?? 0}</KpiValue>
                    <KpiLabel>Pending purchase orders</KpiLabel>
                    <KpiTrendMuted>Awaiting receipt</KpiTrendMuted>
                  </>
                )}
              </KpiMain>
              <KpiSparkWrap>
                <MiniSpark data={sparkPending} color={kpiSparkColors[3]} />
              </KpiSparkWrap>
            </KpiCard>
          </KpiGrid>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <RevenueCard>
                <RevenueHead>
                  <RevenueTitle>Total revenue</RevenueTitle>
                  <Tabs
                    size="small"
                    activeKey={chartPeriod}
                    onChange={onChartPeriodChange}
                    items={[
                      { key: 'week', label: 'Week' },
                      { key: 'month', label: 'Month' },
                      { key: 'year', label: 'Year' },
                    ]}
                  />
                </RevenueHead>
                <RevenueMetrics>
                  <MetricBlock>
                    <MetricLabel>Current period</MetricLabel>
                    <MetricValue>{stats?.todaysSales?.formattedValue ?? formatPkr(0)}</MetricValue>
                  </MetricBlock>
                  <MetricBlock>
                    <MetricLabel>Previous period</MetricLabel>
                    <MetricValue $muted>
                      {prevRevTotal != null ? formatPkr(prevRevTotal) : '—'}
                    </MetricValue>
                  </MetricBlock>
                </RevenueMetrics>
                <ChartPane>
                  {loading ? (
                    <Skeleton active style={{ padding: 24 }} />
                  ) : areaDataWithPrevious.length ? (
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <ComposedChart data={areaDataWithPrevious} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#5F63F2" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#5F63F2" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#9ca3af"
                            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                          />
                          <Tooltip formatter={chartTooltipPkr} />
                          <Area
                            type="monotone"
                            dataKey="sales"
                            name="Current period"
                            stroke="#5F63F2"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                          />
                          <Line
                            type="monotone"
                            dataKey="previous"
                            name="Previous period (scaled)"
                            stroke="#94a3b8"
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>
                      No sales data for this range.
                    </div>
                  )}
                </ChartPane>
              </RevenueCard>
            </Col>

            <Col xs={24} xl={8}>
              <SideTableCard>
                <SideTableHead>Top revenue — products</SideTableHead>
                <SideTableBody>
                  <Table
                    dataSource={topProductRows}
                    columns={topProductColumns}
                    pagination={false}
                    loading={loading}
                    size="small"
                    scroll={{ x: 320 }}
                  />
                </SideTableBody>
              </SideTableCard>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 4 }}>
            <Col xs={24} lg={14}>
              <TableCard>
                <TableCardHead>Recent sales (period)</TableCardHead>
                <Table
                  dataSource={recentSalesRows}
                  columns={recentSalesColumns}
                  pagination={{ pageSize: 6, size: 'small' }}
                  loading={loading}
                  size="small"
                />
              </TableCard>
            </Col>
            <Col xs={24} lg={10}>
              <TableCard>
                <TableCardHead>Recent activity</TableCardHead>
                <Table
                  dataSource={activityRows}
                  columns={activityColumns}
                  pagination={false}
                  loading={loading}
                  size="small"
                />
              </TableCard>
            </Col>
          </Row>
        </DashboardPage>
      </Main>
    </>
  );
}

export default Dashboard;
