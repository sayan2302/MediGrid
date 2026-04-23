import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api'
});

let pendingRequests = 0;
const loadingSubscribers = new Set();
const successSubscribers = new Set();
const errorSubscribers = new Set();

const normalizeUrl = (url = '') => {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.replace(/\/[0-9a-fA-F]{24}(?=\/|$)/g, '/:id');
};

const getSuccessMessage = (config, response) => {
  const method = (config?.method || 'get').toLowerCase();
  const url = normalizeUrl(config?.url || '');

  const customMap = [
    { method: 'post', pattern: '/setup/seed-demo', message: 'Demo data loaded. You can now test all modules.' },
    { method: 'post', pattern: '/alerts/recompute', message: 'Alerts refreshed from current stock and expiry conditions.' },
    { method: 'patch', pattern: '/alerts/:id/resolve', message: 'Alert marked as resolved.' },
    { method: 'post', pattern: '/items', message: 'Inventory item created.' },
    { method: 'patch', pattern: '/items/:id', message: 'Inventory item updated.' },
    { method: 'post', pattern: '/vendors', message: 'Vendor created.' },
    { method: 'patch', pattern: '/vendors/:id', message: 'Vendor updated.' },
    { method: 'post', pattern: '/purchase-orders', message: 'Purchase order created.' },
    { method: 'patch', pattern: '/purchase-orders/:id', message: 'Purchase order updated.' },
    { method: 'post', pattern: '/purchase-orders/:id/submit', message: 'Purchase order submitted for approval.' },
    { method: 'post', pattern: '/purchase-orders/:id/approve', message: 'Purchase order approved.' },
    { method: 'post', pattern: '/purchase-orders/:id/reject', message: 'Purchase order rejected.' },
    { method: 'post', pattern: '/purchase-orders/:id/receive', message: 'Purchase order received. Inventory batches added.' },
    { method: 'post', pattern: '/ai/forecast-demand', message: null },
    { method: 'post', pattern: '/ai/expiry-risk', message: null },
    { method: 'post', pattern: '/inventory/batches', message: 'Inventory batch added.' },
    { method: 'patch', pattern: '/inventory/batches/:id', message: 'Inventory batch updated.' },
    { method: 'delete', pattern: '/inventory/batches/:id', message: 'Inventory batch deleted.' }
  ];

  const matched = customMap.find((entry) => entry.method === method && url.includes(entry.pattern));
  if (matched) {
    return matched.message;
  }

  return response?.data?.message || 'Request completed successfully.';
};

const getErrorMessage = (error) => {
  const method = (error?.config?.method || 'get').toLowerCase();
  const url = normalizeUrl(error?.config?.url || '');
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) {
    return backendMessage;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach backend service. Ensure backend is running on port 4000.';
  }

  const customMap = [
    { method: 'post', pattern: '/setup/seed-demo', message: 'Failed to load demo data.' },
    { method: 'post', pattern: '/alerts/recompute', message: 'Failed to refresh alerts.' },
    { method: 'patch', pattern: '/alerts/:id/resolve', message: 'Failed to resolve alert.' },
    { method: 'post', pattern: '/items', message: 'Failed to create inventory item.' },
    { method: 'post', pattern: '/vendors', message: 'Failed to create vendor.' },
    { method: 'post', pattern: '/purchase-orders', message: 'Failed to create purchase order.' },
    { method: 'post', pattern: '/purchase-orders/:id/submit', message: 'Failed to submit purchase order.' },
    { method: 'post', pattern: '/purchase-orders/:id/approve', message: 'Failed to approve purchase order.' },
    { method: 'post', pattern: '/purchase-orders/:id/reject', message: 'Failed to reject purchase order.' },
    { method: 'post', pattern: '/purchase-orders/:id/receive', message: 'Failed to receive purchase order.' },
    { method: 'post', pattern: '/ai/forecast-demand', message: 'Failed to generate demand forecast.' },
    { method: 'post', pattern: '/ai/expiry-risk', message: 'Failed to generate expiry risk analysis.' }
  ];

  const matched = customMap.find((entry) => entry.method === method && url.includes(entry.pattern));
  if (matched) {
    return matched.message;
  }

  return error?.message || 'Request failed.';
};

const notifyLoadingSubscribers = () => {
  loadingSubscribers.forEach((subscriber) => subscriber(pendingRequests));
};

const emitSuccess = (message) => {
  successSubscribers.forEach((subscriber) => subscriber(message));
};

const emitError = (message) => {
  errorSubscribers.forEach((subscriber) => subscriber(message));
};

export const subscribeApiLoading = (subscriber) => {
  loadingSubscribers.add(subscriber);
  subscriber(pendingRequests);
  return () => loadingSubscribers.delete(subscriber);
};

export const subscribeApiSuccess = (subscriber) => {
  successSubscribers.add(subscriber);
  return () => successSubscribers.delete(subscriber);
};

export const subscribeApiError = (subscriber) => {
  errorSubscribers.add(subscriber);
  return () => errorSubscribers.delete(subscriber);
};

api.interceptors.request.use((config) => {
  pendingRequests += 1;
  notifyLoadingSubscribers();

  const token = localStorage.getItem('medigrid-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    notifyLoadingSubscribers();

    const method = response?.config?.method?.toLowerCase() || 'get';
    if (method !== 'get') {
      const message = getSuccessMessage(response?.config, response);
      if (message) emitSuccess(message);
    }

    return response;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    notifyLoadingSubscribers();

    if (!axios.isCancel(error)) {
      const message = getErrorMessage(error);
      emitError(message);
    }

    return Promise.reject(error);
  }
);

export default api;
