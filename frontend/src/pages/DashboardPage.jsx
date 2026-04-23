import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart,
  FiClock,
  FiCpu,
  FiDatabase,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/client';
import { getKPIData } from '../api/kpi';
import { useAppData } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import { SkeletonMetricsRow, SkeletonChart, SkeletonPins } from '../components/SkeletonLoader';

import PageBanner from '../components/PageBanner';

const CHART_COLORS = ['#e60023', '#103c25', '#6845ab', '#2b48d4'];

// Staggered reveal delays (ms)
const DELAY_OVERVIEW = 1200;
const DELAY_KPI = 2200;
const DELAY_CHARTS = 2800;
const DELAY_HIGHLIGHTS = 3400;

export default function DashboardPage() {
  const { overview, loading, error, setError, fetchAll, items, purchaseOrders, alerts } = useAppData();
  const [alertDist, setAlertDist] = useState([]);
  const [stockTrend, setStockTrend] = useState([]);
  const [seeding, setSeeding] = useState(false);
  
  const [kpiData, setKpiData] = useState(null);
  const [kpiFilters, setKpiFilters] = useState({ startDate: '', endDate: '', itemId: '' });

  const [aiVerdict, setAiVerdict] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiTimerRef = useRef(null);

  // Staggered reveal states
  const [showOverview, setShowOverview] = useState(false);
  const [showKpi, setShowKpi] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const revealTimers = useRef([]);

  const startRevealSequence = () => {
    setShowOverview(false);
    setShowKpi(false);
    setShowCharts(false);
    setShowHighlights(false);

    revealTimers.current.forEach(t => clearTimeout(t));
    revealTimers.current = [
      setTimeout(() => setShowOverview(true), DELAY_OVERVIEW),
      setTimeout(() => setShowKpi(true), DELAY_KPI),
      setTimeout(() => setShowCharts(true), DELAY_CHARTS),
      setTimeout(() => setShowHighlights(true), DELAY_HIGHLIGHTS)
    ];
  };

  useEffect(() => {
    startRevealSequence();
    return () => revealTimers.current.forEach(t => clearTimeout(t));
  }, []);

  const generateVerdict = (data) => {
    if (!data) return null;
    const bullets = [];
    let overallSeverity = 'good';

    // Stock-out analysis
    if (data.stockOutRate > 10) {
      bullets.push({ icon: '🚨', text: `Critical stock-out rate at ${data.stockOutRate}%. Immediate procurement action required — demand is consistently exceeding supply.`, severity: 'critical' });
      overallSeverity = 'critical';
    } else if (data.stockOutRate > 3) {
      bullets.push({ icon: '⚠️', text: `Stock-out rate of ${data.stockOutRate}% detected. Consider increasing reorder levels for high-demand items to prevent service disruption.`, severity: 'warning' });
      if (overallSeverity === 'good') overallSeverity = 'warning';
    } else {
      bullets.push({ icon: '✅', text: `Stock availability is strong at ${data.stockOutRate}% stock-out rate. Supply chain is meeting demand effectively.`, severity: 'good' });
    }

    // Turnover analysis
    if (data.inventoryTurnover > 3) {
      bullets.push({ icon: '🔄', text: `Inventory turnover ratio of ${data.inventoryTurnover}x indicates rapid stock movement. Verify buffer stock is adequate to prevent shortages.`, severity: 'good' });
    } else if (data.inventoryTurnover > 1) {
      bullets.push({ icon: '📦', text: `Turnover ratio of ${data.inventoryTurnover}x is within normal range. Inventory is cycling at a healthy pace.`, severity: 'good' });
    } else {
      bullets.push({ icon: '🐌', text: `Low turnover ratio of ${data.inventoryTurnover}x — inventory is sitting idle. Evaluate purchasing volumes to reduce holding costs.`, severity: 'warning' });
      if (overallSeverity === 'good') overallSeverity = 'warning';
    }

    // Expiry analysis
    if (data.expiryLossRate > 5) {
      bullets.push({ icon: '🗑️', text: `Expiry loss rate of ${data.expiryLossRate}% is significantly high. Implement FEFO (First Expiry First Out) and reduce batch sizes for perishable items.`, severity: 'critical' });
      overallSeverity = 'critical';
    } else if (data.expiryLossRate > 1) {
      bullets.push({ icon: '📅', text: `Expiry losses at ${data.expiryLossRate}% — monitor near-expiry batches closely and consider promotional consumption drives.`, severity: 'warning' });
      if (overallSeverity === 'good') overallSeverity = 'warning';
    } else {
      bullets.push({ icon: '✅', text: `Expiry loss rate of ${data.expiryLossRate}% is well-controlled. Batch rotation practices are effective.`, severity: 'good' });
    }

    // Procurement analysis
    if (data.procurementCycleTimeDays > 14) {
      bullets.push({ icon: '🕐', text: `Average procurement cycle of ${data.procurementCycleTimeDays} days is slow. Review approval bottlenecks and vendor delivery SLAs.`, severity: 'warning' });
      if (overallSeverity === 'good') overallSeverity = 'warning';
    } else if (data.procurementCycleTimeDays > 0) {
      bullets.push({ icon: '⚡', text: `Procurement cycle time of ${data.procurementCycleTimeDays} days is efficient. Fulfillment pipeline is healthy.`, severity: 'good' });
    } else {
      bullets.push({ icon: '📋', text: `No completed procurement cycles detected in this period. Submit and receive purchase orders to establish baseline metrics.`, severity: 'neutral' });
    }

    const summaryMap = {
      good: 'Overall operational health is strong. Continue monitoring KPIs to maintain performance.',
      warning: 'Some KPIs need attention. Targeted improvements in the flagged areas can prevent escalation.',
      critical: 'Multiple metrics are in critical range. Immediate operational review and corrective action recommended.'
    };

    return { bullets, overallSeverity, summary: summaryMap[overallSeverity] };
  };

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

  const loadKPIs = async () => {
    try {
      const data = await getKPIData(kpiFilters);
      setKpiData(data);
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    }
  };

  useEffect(() => {
    loadCharts();
  }, []);

  useEffect(() => {
    loadKPIs();
  }, [kpiFilters]);

  useEffect(() => {
    if (!kpiData) {
      setAiVerdict(null);
      return;
    }
    setAiLoading(true);
    setAiVerdict(null);
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      setAiVerdict(generateVerdict(kpiData));
      setAiLoading(false);
    }, 3000);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [kpiData]);

  const seedDemoData = async () => {
    setSeeding(true);
    setError('');
    try {
      await api.post('/setup/seed-demo', { forceReset: true });
      startRevealSequence();
      await Promise.all([fetchAll(), loadCharts(), loadKPIs()]);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleRefresh = () => {
    startRevealSequence();
    Promise.all([fetchAll(), loadCharts(), loadKPIs()]);
  };

  const highlightPins = useMemo(() => {
    const stockPins = items.slice(0, 4).map((item, index) => ({
      key: `item-${item._id}`,
      title: item.name,
      subtitle: item.category,
      chipClass: `chip-${item.category.toLowerCase().replace(/\s+/g, '-')}`,
      detail: `Reorder at ${item.reorderLevel} ${item.unit}`,
      tone: index % 2 === 0 ? 'rose' : 'sand'
    }));

    const alertPins = alerts.slice(0, 3).map((alert) => ({
      key: `alert-${alert._id}`,
      title: alert.type.replace('_', ' '),
      subtitle: alert.severity,
      chipClass: `chip-${alert.severity.toLowerCase()}`,
      detail: alert.message,
      tone: alert.severity === 'CRITICAL' ? 'rose' : 'sand'
    }));

    const poPins = purchaseOrders.slice(0, 3).map((po) => ({
      key: `po-${po._id}`,
      title: po.poNumber,
      subtitle: po.status,
      chipClass: `chip-${po.status.toLowerCase()}`,
      detail: `${po.lines.length} line item(s) from ${po.vendorId?.name || 'Unknown vendor'}`,
      tone: po.status === 'Approved' ? 'green' : 'sand'
    }));

    return [...stockPins, ...alertPins, ...poPins];
  }, [items, alerts, purchaseOrders]);

  const hasAnyData = (overview?.totalItems || 0) > 0;

  return (
    <div className="page-grid">
      {error ? <p className="error-banner">{error}</p> : null}

      <PageBanner
        badge="Operational Intelligence"
        badgeIcon={<FiBarChart />}
        title="Supply visibility that feels as fast as pinning ideas."
        description="Track hospital stock, procurement approvals, and expiry risk in one warm, high-context command center."
        theme="slate"
        actions={
          <>
            <button type="button" onClick={seedDemoData} disabled={seeding}>
              <FiDatabase />
              {seeding ? 'Loading demo data...' : 'Load Demo Data'}
            </button>
            <button type="button" className="button-secondary" onClick={handleRefresh}>
              <FiRefreshCw />
              Refresh Dashboard
            </button>
          </>
        }
      />

      {/* ── Overview Metrics ── */}
      {!showOverview ? (
        <SkeletonMetricsRow count={4} />
      ) : (
        <section className="metrics-grid section-reveal">
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
      )}

      {/* ── KPI Section ── */}
      <section className="pin-card kpi-section" style={{ marginTop: '2.5rem', borderLeft: '4px solid #6845ab', backgroundColor: '#fcfbfa' }}>
        <header className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eaeaea' }}>
          <div>
            <h3 style={{ color: '#103c25' }}>Operational KPIs</h3>
            <p style={{ color: '#666', marginTop: '4px' }}>Track availability, efficiency, and waste</p>
          </div>
          <div className="kpi-filters" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#fff', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <input 
              type="date" 
              value={kpiFilters.startDate} 
              onChange={e => setKpiFilters({...kpiFilters, startDate: e.target.value})}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '0.9rem', color: '#333' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>to</span>
            <input 
              type="date" 
              value={kpiFilters.endDate} 
              onChange={e => setKpiFilters({...kpiFilters, endDate: e.target.value})}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '0.9rem', color: '#333' }}
            />
            <select 
              value={kpiFilters.itemId} 
              onChange={e => setKpiFilters({...kpiFilters, itemId: e.target.value})}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e0e0e0', fontSize: '0.9rem', color: '#333', minWidth: '150px' }}
            >
              <option value="">All Items</option>
              {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
        </header>
        
        {!showKpi ? (
          <div style={{ marginTop: '2rem' }}>
            <SkeletonMetricsRow count={4} />
          </div>
        ) : (
          <div className="metrics-grid section-reveal" style={{ marginTop: '2rem', gap: '1.5rem' }}>
            <MetricCard
              label="Stock-out Rate"
              value={kpiData ? `${kpiData.stockOutRate}%` : '--'}
              hint="Demand instances with insufficient stock"
              icon={<FiAlertCircle />}
              tone={kpiData?.stockOutRate > 5 ? 'rose' : 'green'}
              tooltip={{
                title: 'Stock-out Rate (Availability)',
                description: 'Percentage of demand requests where inventory was insufficient to fulfill the order.',
                formula: '(Stock-out Events / Total Demand Requests) × 100'
              }}
            />
            <MetricCard
              label="Inventory Turnover"
              value={kpiData ? kpiData.inventoryTurnover : '--'}
              hint="Consumption vs Average Inventory"
              icon={<FiRefreshCw />}
              tone="sand"
              tooltip={{
                title: 'Inventory Turnover Ratio (Efficiency)',
                description: 'Measures how efficiently inventory is consumed. Higher values indicate faster stock rotation.',
                formula: 'Total Consumption / ((Opening Stock + Closing Stock) / 2)'
              }}
            />
            <MetricCard
              label="Expiry Loss Rate"
              value={kpiData ? `${kpiData.expiryLossRate}%` : '--'}
              hint="Value lost due to batch expiry"
              icon={<FiPackage />}
              tone={kpiData?.expiryLossRate > 2 ? 'rose' : 'sand'}
              tooltip={{
                title: 'Expiry Loss Rate (Wastage)',
                description: 'Percentage of total inventory value lost because batches expired before use.',
                formula: '(Value of Expired Items / Total Inventory Value) × 100'
              }}
            />
            <MetricCard
              label="Procurement Cycle"
              value={kpiData ? `${kpiData.procurementCycleTimeDays}d` : '--'}
              hint="Avg. days from request to delivery"
              icon={<FiClock />}
              tone="sand"
              tooltip={{
                title: 'Procurement Cycle Time (Process)',
                description: 'Average time from purchase order submission to goods received. Lower is better.',
                formula: 'Avg(Fulfillment Date − Request Creation Date)'
              }}
            />
          </div>
        )}

        {(aiLoading || aiVerdict) && (
          <div className="ai-verdict-block" style={{ marginTop: '2rem' }}>
            <div className="ai-verdict-header">
              <FiCpu size={16} />
              <span>AI Analysis Engine</span>
            </div>

            {aiLoading && (
              <div className="ai-verdict-loading">
                <div className="ai-pulse-bar" />
                <p className="ai-loading-text">Analyzing KPI patterns and generating operational verdict...</p>
              </div>
            )}

            {aiVerdict && !aiLoading && (
              <div className={`ai-verdict-body severity-${aiVerdict.overallSeverity}`}>
                <ul className="ai-verdict-list">
                  {aiVerdict.bullets.map((b, idx) => (
                    <li key={idx} className={`ai-bullet severity-${b.severity}`}>
                      <span className="ai-bullet-icon">{b.icon}</span>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="ai-verdict-summary">
                  <strong>Verdict:</strong> {aiVerdict.summary}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Charts ── */}
      {!showCharts ? (
        <section className="chart-row">
          <article className="chart-card pin-card">
            <header className="section-head">
              <h3>Alert Distribution</h3>
              <p>Severity spread across unresolved alerts</p>
            </header>
            <SkeletonChart />
          </article>
          <article className="chart-card pin-card">
            <header className="section-head">
              <h3>Stock Additions Trend</h3>
              <p>Month-wise inbound quantity</p>
            </header>
            <SkeletonChart />
          </article>
        </section>
      ) : (
        <section className="chart-row section-reveal">
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
                    <Legend />
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
                  <LineChart data={stockTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stockAdded" stroke="#e60023" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </section>
      )}

      {/* ── Operational Highlights ── */}
      {!showHighlights ? (
        <section className="pin-card masonry-card">
          <header className="section-head">
            <h3>Operational Highlights</h3>
            <p>Dense, visual snippets from inventory, alerts, and procurement</p>
          </header>
          <SkeletonPins count={6} />
        </section>
      ) : (
        <section className="pin-card masonry-card section-reveal">
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
                  <p className={`pin-subtitle ${pin.chipClass || ''}`}>{pin.subtitle}</p>
                  <p className="pin-detail">{pin.detail}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? <p className="muted-note">Refreshing operational data...</p> : null}
    </div>
  );
}
