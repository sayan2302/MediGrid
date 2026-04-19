import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import MetricCard from '../components/MetricCard';

const COLORS = ['#0ea5e9', '#f43f5e', '#f59e0b', '#22c55e'];

export default function DashboardPage() {
  const { overview, loading, error } = useAppData();
  const [alertDist, setAlertDist] = useState([]);
  const [stockTrend, setStockTrend] = useState([]);

  useEffect(() => {
    const loadCharts = async () => {
      const [alertRes, stockRes] = await Promise.all([
        api.get('/dashboard/charts/alert-distribution'),
        api.get('/dashboard/charts/stock-trend')
      ]);
      setAlertDist(alertRes.data);
      setStockTrend(stockRes.data);
    };
    loadCharts().catch(console.error);
  }, []);

  return (
    <div className="page-grid">
      {error ? <p className="error-banner">{error}</p> : null}
      <section className="metrics-grid">
        <MetricCard label="Total Items" value={overview?.totalItems ?? '--'} hint="Active catalog count" />
        <MetricCard label="Low Stock Items" value={overview?.lowStockItems ?? '--'} hint="Needs procurement" />
        <MetricCard label="Expiring Items" value={overview?.expiringItems ?? '--'} hint="Within threshold window" />
        <MetricCard label="Pending POs" value={overview?.pendingPurchaseOrders ?? '--'} hint="Draft, submitted, approved" />
      </section>

      <section className="chart-card">
        <h3>Alert Distribution</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={alertDist} dataKey="count" nameKey="severity" outerRadius={95} label>
                {alertDist.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <h3>Stock Additions Trend</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockTrend}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stockAdded" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {loading ? <p>Refreshing data...</p> : null}
    </div>
  );
}
