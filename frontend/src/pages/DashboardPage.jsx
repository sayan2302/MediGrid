import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart,
  FiClock,
  FiDatabase,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';

const CHART_COLORS = ['#e60023', '#103c25', '#6845ab', '#2b48d4'];

export default function DashboardPage() {
  const { overview, loading, error, setError, fetchAll, items, purchaseOrders, alerts } = useAppData();
  const [alertDist, setAlertDist] = useState([]);
  const [stockTrend, setStockTrend] = useState([]);
  const [seeding, setSeeding] = useState(false);

  const loadCharts = async () => {
    try {
      const [alertRes, stockRes] = await Promise.all([
        api.get('/dashboard/charts/alert-distribution'),
        api.get('/dashboard/charts/stock-trend')
      ]);
      setAlertDist(alertRes.data);
      setStockTrend(stockRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    loadCharts();
  }, []);

  const seedDemoData = async () => {
    setSeeding(true);
    setError('');
    try {
      await api.post('/setup/seed-demo', {});
      await Promise.all([fetchAll(), loadCharts()]);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSeeding(false);
    }
  };

  const highlightPins = useMemo(() => {
    const stockPins = items.slice(0, 4).map((item, index) => ({
      key: `item-${item._id}`,
      title: item.name,
      subtitle: item.category,
      detail: `Reorder at ${item.reorderLevel} ${item.unit}`,
      tone: index % 2 === 0 ? 'rose' : 'sand'
    }));

    const alertPins = alerts.slice(0, 3).map((alert) => ({
      key: `alert-${alert._id}`,
      title: alert.type.replace('_', ' '),
      subtitle: alert.severity,
      detail: alert.message,
      tone: alert.severity === 'CRITICAL' ? 'rose' : 'sand'
    }));

    const poPins = purchaseOrders.slice(0, 3).map((po) => ({
      key: `po-${po._id}`,
      title: po.poNumber,
      subtitle: po.status,
      detail: `${po.lines.length} line item(s) from ${po.vendorId?.name || 'Unknown vendor'}`,
      tone: po.status === 'Approved' ? 'green' : 'sand'
    }));

    return [...stockPins, ...alertPins, ...poPins];
  }, [items, alerts, purchaseOrders]);

  const hasAnyData = (overview?.totalItems || 0) > 0;

  return (
    <div className="page-grid">
      {error ? <p className="error-banner">{error}</p> : null}

      <section className="hero-card pin-card">
        <div>
          <p className="kicker">Operational intelligence</p>
          <h1>Supply visibility that feels as fast as pinning ideas.</h1>
          <p>
            Track hospital stock, procurement approvals, and expiry risk in one warm, high-context command center.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={seedDemoData} disabled={seeding}>
            <FiDatabase />
            {seeding ? 'Loading demo data...' : 'Load Demo Data'}
          </button>
          <button type="button" className="button-secondary" onClick={() => Promise.all([fetchAll(), loadCharts()])}>
            <FiRefreshCw />
            Refresh Dashboard
          </button>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          label="Total Items"
          value={overview?.totalItems ?? '--'}
          hint="Active inventory catalog"
          icon={<FiPackage />}
          tone="sand"
        />
        <MetricCard
          label="Low Stock"
          value={overview?.lowStockItems ?? '--'}
          hint="Below reorder threshold"
          icon={<FiAlertCircle />}
          tone="rose"
        />
        <MetricCard
          label="Expiring"
          value={overview?.expiringItems ?? '--'}
          hint="Risk within alert window"
          icon={<FiClock />}
          tone="sand"
        />
        <MetricCard
          label="Pending POs"
          value={overview?.pendingPurchaseOrders ?? '--'}
          hint="Draft, submitted, approved"
          icon={<FiShoppingBag />}
          tone="green"
        />
      </section>

      <section className="chart-row">
        <article className="chart-card pin-card">
          <header className="section-head">
            <h3>Alert Distribution</h3>
            <p>Severity spread across unresolved alerts</p>
          </header>
          <div className="chart-box">
            {alertDist.length === 0 ? (
              <EmptyState
                icon={<FiAlertCircle />}
                title="No alert activity yet"
                description="Alerts will appear as soon as stock or expiry conditions are triggered."
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={alertDist} dataKey="count" nameKey="severity" outerRadius={95} label>
                    {alertDist.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="chart-card pin-card">
          <header className="section-head">
            <h3>Stock Additions Trend</h3>
            <p>Month-wise inbound quantity</p>
          </header>
          <div className="chart-box">
            {stockTrend.length === 0 ? (
              <EmptyState
                icon={<FiTrendingUp />}
                title="No trend data yet"
                description="Receive purchase orders or add inventory batches to start trend tracking."
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockTrend}>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stockAdded" fill="#e60023" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="pin-card masonry-card">
        <header className="section-head">
          <h3>Operational Highlights</h3>
          <p>Dense, visual snippets from inventory, alerts, and procurement</p>
        </header>

        {!hasAnyData ? (
          <EmptyState
            icon={<FiActivity />}
            title="No operational highlights yet"
            description="Seed demo data or start adding items to build your pin wall automatically."
          />
        ) : (
          <div className="pin-wall">
            {highlightPins.map((pin) => (
              <article key={pin.key} className={`pin tone-${pin.tone}`}>
                <h4>{pin.title}</h4>
                <p className="pin-subtitle">{pin.subtitle}</p>
                <p className="pin-detail">{pin.detail}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {loading ? <p className="muted-note">Refreshing operational data...</p> : null}
    </div>
  );
}
