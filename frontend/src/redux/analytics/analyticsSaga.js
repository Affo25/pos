import { all, takeLatest, put, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as analyticsService from './analyticsService';

import {
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
} from './analyticsSlice';

// ================= DASHBOARD =================
function* fetchDashboard({ payload }) {
  try {
    yield put(operationStart());
    const res = yield call(analyticsService.getDashboardData, payload);
    yield put(setDashboardData(res?.data ?? res));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= SALES OVERVIEW =================
function* fetchSalesOverview({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getSalesOverview, payload);
    yield put(setSalesOverview(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= TOP PRODUCTS =================
function* fetchTopProducts({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getTopProducts, payload);
    yield put(setTopProducts(data?.products ?? data ?? []));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= RECENT ACTIVITIES =================
function* fetchRecentActivities({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getRecentActivities, payload);
    yield put(setRecentActivities(data?.activities ?? data ?? []));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= ANALYTICS DASHBOARD =================
function* fetchAnalyticsDashboard({ payload }) {
  try {
    yield put(operationStart());
    const res = yield call(analyticsService.getAnalyticsDashboard, payload);
    yield put(setAnalyticsDashboard(res?.data ?? res));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= SALES CHART =================
function* fetchSalesChart({ payload }) {
  try {
    yield put(operationStart());
    const res = yield call(analyticsService.getSalesChartData, payload);
    const rows = res?.data ?? [];
    const maxVal = Math.max(...rows.map((d) => d.totalSales || 0), 1);
    const chart = rows.map((d, i) => {
      const groupId = d['_id'];
      const label =
        groupId != null && groupId !== ''
          ? String(groupId)
          : `Point ${i + 1}`;
      return {
        month: label,
        value: Math.round(((d.totalSales || 0) / maxVal) * 100),
        totalSales: d.totalSales || 0,
      };
    });
    yield put(setSalesChart(chart));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= PRODUCT ANALYTICS =================
function* fetchProductAnalytics({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getProductAnalytics, payload);
    yield put(setProductAnalytics(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= STOCK ANALYTICS =================
function* fetchStockAnalytics() {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getStockAnalytics);
    yield put(setStockAnalytics(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= LOW STOCK =================
function* fetchLowStockProducts({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getLowStockProducts, payload);
    yield put(setLowStockProducts(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= CUSTOMER ANALYTICS =================
function* fetchCustomerAnalytics() {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getCustomerAnalytics);
    yield put(setCustomerAnalytics(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= TOP CUSTOMERS =================
function* fetchTopCustomers({ payload }) {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getTopCustomers, payload);
    yield put(setTopCustomers(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= REALTIME =================
function* fetchRealtimeStats() {
  try {
    yield put(operationStart());
    const data = yield call(analyticsService.getRealtimeStats);
    yield put(setRealtimeStats(data));
    yield put(operationSuccess());
  } catch (error) {
    yield put(operationFailure(error.message));
    toast.error(error.message);
  }
}

// ================= ROOT =================
export default function* analyticsSaga() {
  yield all([
    takeLatest('analytics/fetchDashboard', fetchDashboard),
    takeLatest('analytics/fetchSalesOverview', fetchSalesOverview),
    takeLatest('analytics/fetchTopProducts', fetchTopProducts),
    takeLatest('analytics/fetchRecentActivities', fetchRecentActivities),
    takeLatest('analytics/fetchAnalyticsDashboard', fetchAnalyticsDashboard),
    takeLatest('analytics/fetchSalesChart', fetchSalesChart),
    takeLatest('analytics/fetchProductAnalytics', fetchProductAnalytics),
    takeLatest('analytics/fetchStockAnalytics', fetchStockAnalytics),
    takeLatest('analytics/fetchLowStockProducts', fetchLowStockProducts),
    takeLatest('analytics/fetchCustomerAnalytics', fetchCustomerAnalytics),
    takeLatest('analytics/fetchTopCustomers', fetchTopCustomers),
    takeLatest('analytics/fetchRealtimeStats', fetchRealtimeStats),
  ]);
}