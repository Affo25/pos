import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboard: null,
  salesOverview: null,
  topProducts: [],
  recentActivities: [],
  analyticsDashboard: null,
  salesChart: null,
  productAnalytics: [],
  stockAnalytics: null,
  lowStockProducts: [],
  customerAnalytics: null,
  topCustomers: [],
  realtimeStats: null,

  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    operationStart(state) {
      state.loading = true;
      state.error = null;
    },
    operationSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    operationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ================= SUCCESS STATES =================
    setDashboardData(state, action) {
      state.dashboard = action.payload;
    },
    setSalesOverview(state, action) {
      state.salesOverview = action.payload;
    },
    setTopProducts(state, action) {
      state.topProducts = action.payload;
    },
    setRecentActivities(state, action) {
      state.recentActivities = action.payload;
    },
    setAnalyticsDashboard(state, action) {
      state.analyticsDashboard = action.payload;
    },
    setSalesChart(state, action) {
      state.salesChart = action.payload;
    },
    setProductAnalytics(state, action) {
      state.productAnalytics = action.payload;
    },
    setStockAnalytics(state, action) {
      state.stockAnalytics = action.payload;
    },
    setLowStockProducts(state, action) {
      state.lowStockProducts = action.payload;
    },
    setCustomerAnalytics(state, action) {
      state.customerAnalytics = action.payload;
    },
    setTopCustomers(state, action) {
      state.topCustomers = action.payload;
    },
    setRealtimeStats(state, action) {
      state.realtimeStats = action.payload;
    },
  },
});

// ================= ACTION TRIGGERS (FOR SAGA) =================
const fetchDashboard = (params) => ({
  type: 'analytics/fetchDashboard',
  payload: params,
});

const fetchSalesOverview = (params) => ({
  type: 'analytics/fetchSalesOverview',
  payload: params,
});

const fetchTopProducts = (limit) => ({
  type: 'analytics/fetchTopProducts',
  payload: limit,
});

const fetchRecentActivities = (limit) => ({
  type: 'analytics/fetchRecentActivities',
  payload: limit,
});

const fetchAnalyticsDashboard = (params) => ({
  type: 'analytics/fetchAnalyticsDashboard',
  payload: params,
});

const fetchSalesChart = (params) => ({
  type: 'analytics/fetchSalesChart',
  payload: params,
});

const fetchProductAnalytics = (params) => ({
  type: 'analytics/fetchProductAnalytics',
  payload: params,
});

const fetchStockAnalytics = () => ({
  type: 'analytics/fetchStockAnalytics',
});

const fetchLowStockProducts = (limit) => ({
  type: 'analytics/fetchLowStockProducts',
  payload: limit,
});

const fetchCustomerAnalytics = () => ({
  type: 'analytics/fetchCustomerAnalytics',
});

const fetchTopCustomers = (limit) => ({
  type: 'analytics/fetchTopCustomers',
  payload: limit,
});

const fetchRealtimeStats = () => ({
  type: 'analytics/fetchRealtimeStats',
});

// ================= EXPORTS =================
export const {
  operationStart,
  operationSuccess,
  operationFailure,
  setDashboardData,
  setSalesOverview,
  setTopProducts,
  setRecentActivities,
  setAnalyticsDashboard,
  setSalesChart,
  setProductAnalytics,
  setStockAnalytics,
  setLowStockProducts,
  setCustomerAnalytics,
  setTopCustomers,
  setRealtimeStats,
} = analyticsSlice.actions;

export {
  fetchDashboard,
  fetchSalesOverview,
  fetchTopProducts,
  fetchRecentActivities,
  fetchAnalyticsDashboard,
  fetchSalesChart,
  fetchProductAnalytics,
  fetchStockAnalytics,
  fetchLowStockProducts,
  fetchCustomerAnalytics,
  fetchTopCustomers,
  fetchRealtimeStats,
};

export default analyticsSlice.reducer;