import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [overview, setOverview] = useState(null);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, inventoryRes, alertRes, poRes, itemsRes, vendorsRes] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/inventory/summary'),
        api.get('/alerts'),
        api.get('/purchase-orders'),
        api.get('/items'),
        api.get('/vendors')
      ]);
      setOverview(overviewRes.data);
      setInventorySummary(inventoryRes.data);
      setAlerts(alertRes.data);
      setPurchaseOrders(poRes.data);
      setItems(itemsRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const value = useMemo(
    () => ({
      overview,
      inventorySummary,
      alerts,
      purchaseOrders,
      items,
      vendors,
      loading,
      error,
      fetchAll,
      setError
    }),
    [overview, inventorySummary, alerts, purchaseOrders, items, vendors, loading, error]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppProvider');
  }
  return ctx;
};
