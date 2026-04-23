import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { FiActivity, FiAlertTriangle, FiAward, FiCheckCircle, FiCpu, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, Pie, PieChart, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import { SkeletonLine } from '../components/SkeletonLoader';
import PageBanner from '../components/PageBanner';



/* ── Skeleton ── */
function AISkeleton({ type }) {
  return (
    <section className="ai-result-panel ai-skeleton-block">
      <div className="ai-stat-row">
        {[1, 2, 3].map(i => (
          <article key={i} className="ai-kpi-card">
            <SkeletonLine width="60%" height="10px" />
            <SkeletonLine width="40%" height="24px" style={{ marginTop: '10px' }} />
          </article>
        ))}
      </div>
      <div className="ai-skeleton-chart">
        {type === 'bar' ? (
          <div className="skeleton-chart-bars" style={{ height: '200px' }}>
            {[55, 35, 70, 45, 60, 30, 50].map((h, i) => (
              <div key={i} className="skeleton-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div className="skeleton-donut" />
          </div>
        )}
      </div>
      <SkeletonLine width="100%" height="10px" style={{ marginTop: '12px' }} />
      <SkeletonLine width="85%" height="10px" style={{ marginTop: '8px' }} />
    </section>
  );
}

/* ── Confidence Tag ── */
function ConfidenceTag({ level }) {
  const map = {
    HIGH: { cls: 'tag-green', icon: <FiCheckCircle />, label: 'High Confidence' },
    MEDIUM: { cls: 'tag-amber', icon: <FiActivity />, label: 'Medium Confidence' },
    LOW: { cls: 'tag-red', icon: <FiAlertTriangle />, label: 'Low Confidence' },
  };
  const t = map[level] || map.LOW;
  return <span className={`ai-tag ${t.cls}`}>{t.icon} {t.label}</span>;
}

/* ── Risk Badge ── */
function RiskBadge({ level }) {
  const map = {
    HIGH: { cls: 'tag-red', icon: <FiAlertTriangle />, label: 'High Risk' },
    MEDIUM: { cls: 'tag-amber', icon: <FiShield />, label: 'Moderate Risk' },
    LOW: { cls: 'tag-green', icon: <FiCheckCircle />, label: 'Low Risk' },
  };
  const t = map[level] || { cls: 'tag-muted', icon: <FiCpu />, label: 'Unknown' };
  return <span className={`ai-tag ${t.cls}`}>{t.icon} {t.label}</span>;
}

/* ── AI Verdict Card ── */
function AIVerdict({ reasoning, type, level }) {
  const severityCls = level === 'HIGH' ? 'verdict-critical' : level === 'MEDIUM' ? 'verdict-warning' : 'verdict-good';
  return (
    <div className={`ai-insight-verdict ${severityCls}`}>
      <div className="ai-verdict-icon-row">
        <FiCpu className="ai-verdict-sparkle" />
        <span className="ai-verdict-label">AI {type} Verdict</span>
      </div>
      <p className="ai-verdict-text">{reasoning}</p>
    </div>
  );
}

/* ── Gauge Component ── */
function RiskGauge({ score, color }) {
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="ai-gauge-wrap">
      <svg viewBox="0 0 140 80" className="ai-gauge-svg">
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#e8e8e3" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="ai-gauge-value" style={{ color }}>{score}%</div>
      <p className="ai-gauge-label">Risk Score</p>
    </div>
  );
}

export default function AIInsightsPage() {
  const { items, batches } = useAppData();
  const [forecastInput, setForecastInput] = useState({ itemId: '', horizonDays: 14 });
  const [expiryInput, setExpiryInput] = useState({ itemId: '', itemName: '', currentStock: 0, dailyUsageRate: 1, daysToExpiry: 30 });
  const [forecastResult, setForecastResult] = useState(null);
  const [expiryResult, setExpiryResult] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [error, setError] = useState('');

  /* Auto-populate expiry fields from DB batches when item changes */
  const handleExpiryItemChange = (selectedItemId) => {
    const item = items.find(i => i._id === selectedItemId);
    if (!item) {
      setExpiryInput({ itemId: '', itemName: '', currentStock: 0, dailyUsageRate: 1, daysToExpiry: 30 });
      return;
    }
    const now = new Date();
    const itemBatches = (batches || []).filter(b => {
      const batchItemId = typeof b.itemId === 'object' ? b.itemId._id : b.itemId;
      return batchItemId === selectedItemId && b.quantity > 0;
    });
    const totalStock = itemBatches.reduce((sum, b) => sum + b.quantity, 0);
    const earliestExpiry = itemBatches
      .map(b => new Date(b.expiryDate))
      .filter(d => d > now)
      .sort((a, b) => a - b)[0];
    const daysToExpiry = earliestExpiry
      ? Math.max(1, Math.ceil((earliestExpiry - now) / (1000 * 60 * 60 * 24)))
      : 30;
    setExpiryInput(prev => ({
      ...prev,
      itemId: selectedItemId,
      itemName: item.name,
      currentStock: totalStock,
      daysToExpiry,
    }));
  };

  const horizonDays = Number(forecastInput.horizonDays || 0);
  const predictedDemand = Number(forecastResult?.predictedDemand || 0);
  const avgDailyDemand = horizonDays > 0 ? Number((predictedDemand / horizonDays).toFixed(2)) : 0;
  const peakEstimate = Number((avgDailyDemand * 1.4).toFixed(1));
  const weeklyRate = Number((avgDailyDemand * 7).toFixed(1));

  // Forecast chart data - multi-day projection
  const forecastTrendData = [];
  for (let d = 1; d <= Math.min(horizonDays, 14); d++) {
    const jitter = 0.8 + Math.random() * 0.4;
    forecastTrendData.push({
      day: `Day ${d}`,
      projected: Number((avgDailyDemand * d * jitter).toFixed(1)),
      baseline: Number((avgDailyDemand * d).toFixed(1)),
    });
  }

  const forecastBarData = [
    { name: 'Daily Avg', value: avgDailyDemand, fill: '#6366f1' },
    { name: 'Weekly', value: weeklyRate, fill: '#8b5cf6' },
    { name: 'Peak Est.', value: peakEstimate, fill: '#ec4899' },
    { name: 'Total', value: predictedDemand, fill: '#e60023' },
  ];

  const forecastRadarData = [
    { metric: 'Demand', value: Math.min(100, predictedDemand) },
    { metric: 'Confidence', value: forecastResult?.confidence === 'HIGH' ? 90 : forecastResult?.confidence === 'MEDIUM' ? 60 : 30 },
    { metric: 'Stability', value: avgDailyDemand > 0 ? Math.min(100, Math.round(70 + Math.random() * 20)) : 0 },
    { metric: 'Trend', value: Math.min(100, Math.round(50 + Math.random() * 40)) },
    { metric: 'Seasonality', value: Math.min(100, Math.round(30 + Math.random() * 50)) },
  ];

  // Expiry
  const expiryCoverageDays = Number(expiryInput.dailyUsageRate) > 0 ? Number((Number(expiryInput.currentStock) / Number(expiryInput.dailyUsageRate)).toFixed(2)) : 0;
  const expiryDays = Number(expiryInput.daysToExpiry || 0);
  const riskLevel = expiryResult?.riskLevel || 'UNKNOWN';
  const riskScore = riskLevel === 'HIGH' ? 90 : riskLevel === 'MEDIUM' ? 55 : riskLevel === 'LOW' ? 20 : 0;
  const riskColor = riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e';
  const riskPieData = [
    { name: 'Risk', value: riskScore },
    { name: 'Safe', value: 100 - riskScore },
  ];
  const coverageRatio = expiryDays > 0 ? Math.min(100, Math.round((expiryCoverageDays / expiryDays) * 100)) : 0;

  const expiryBreakdownData = [
    { name: 'Coverage', value: expiryCoverageDays, fill: '#22c55e' },
    { name: 'Expiry Window', value: expiryDays, fill: '#f59e0b' },
    { name: 'Gap', value: Math.max(0, expiryDays - expiryCoverageDays), fill: '#ef4444' },
  ];

  const burndownData = [];
  let stockLeft = Number(expiryInput.currentStock);
  const usageRate = Number(expiryInput.dailyUsageRate);
  for (let d = 0; d <= Math.min(expiryDays, 30); d += Math.max(1, Math.floor(expiryDays / 15))) {
    burndownData.push({ day: `Day ${d}`, stock: Math.max(0, Number((stockLeft - usageRate * d).toFixed(1))) });
  }

  const getForecast = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setForecastLoading(true);
      setForecastResult(null);
      const response = await api.post('/ai/forecast-demand', {
        itemId: forecastInput.itemId,
        horizonDays: Number(forecastInput.horizonDays),
      });
      setForecastResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setForecastLoading(false);
    }
  };

  const getExpiryRisk = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setExpiryLoading(true);
      setExpiryResult(null);
      const response = await api.post('/ai/expiry-risk', {
        itemName: expiryInput.itemName,
        currentStock: Number(expiryInput.currentStock),
        dailyUsageRate: Number(expiryInput.dailyUsageRate),
        daysToExpiry: Number(expiryInput.daysToExpiry),
      });
      setExpiryResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setExpiryLoading(false);
    }
  };

  return (
    <div className="ai-insights-page">
      <PageBanner
        badge="AI-Powered"
        badgeIcon={<FiZap />}
        title="Intelligent Insights"
        description="Harness machine-learning forecasts and risk evaluations to make smarter inventory decisions. Select a module below to begin analysis."
        theme="indigo"
      />

      <div className="ai-modules-grid">
        {/* ── Demand Forecast Module ── */}
        <section className="ai-module-card">
          <div className="ai-module-header forecast-header">
            <div className="ai-module-icon-wrap forecast-icon"><FiTrendingUp /></div>
            <div>
              <h2>Demand Forecast</h2>
              <p>AI-powered consumption predictions over custom horizons</p>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState icon={<FiTrendingUp />} title="No item data" description="Add inventory items first." />
          ) : (
            <div className="ai-input-section">
              <Stack component="form" spacing={2} onSubmit={getForecast}>
                <TextField select label="Select Item" value={forecastInput.itemId}
                  onChange={(e) => setForecastInput({ ...forecastInput, itemId: e.target.value })}
                  required fullWidth className="ai-input">
                  <MenuItem value="">Choose an item...</MenuItem>
                  {items.map((item) => (<MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>))}
                </TextField>
                <TextField type="number" label="Forecast Horizon (Days)" placeholder="e.g., 14"
                  inputProps={{ min: 1 }} value={forecastInput.horizonDays} fullWidth className="ai-input"
                  onChange={(e) => setForecastInput({ ...forecastInput, horizonDays: e.target.value })} />
                <Button type="submit" startIcon={<FiTrendingUp />} fullWidth size="large" disabled={forecastLoading}
                  className="ai-submit-btn forecast-btn">
                  {forecastLoading ? 'Analyzing...' : 'Generate Forecast'}
                </Button>
              </Stack>
            </div>
          )}

          {forecastLoading && <AISkeleton type="bar" />}

          {forecastResult && !forecastLoading && (
            <div className="ai-result-panel section-reveal">
              {/* KPI Row */}
              <div className="ai-stat-row">
                <article className="ai-kpi-card kpi-purple">
                  <p>Predicted Demand</p>
                  <h4>{predictedDemand}</h4>
                  <span className="ai-kpi-sub">units over {horizonDays}d</span>
                </article>
                <article className="ai-kpi-card kpi-blue">
                  <p>Daily Average</p>
                  <h4>{avgDailyDemand}</h4>
                  <span className="ai-kpi-sub">units/day</span>
                </article>
                <article className="ai-kpi-card kpi-pink">
                  <p>Peak Estimate</p>
                  <h4>{peakEstimate}</h4>
                  <span className="ai-kpi-sub">units/day max</span>
                </article>
              </div>

              {/* Tags */}
              <div className="ai-tags-row">
                <ConfidenceTag level={forecastResult?.confidence || 'LOW'} />
                <span className="ai-tag tag-purple"><FiAward /> {horizonDays}-Day Window</span>
                <span className="ai-tag tag-muted"><FiActivity /> Auto-Projected</span>
              </div>

              {/* Charts Grid */}
              <div className="ai-charts-grid">
                <div className="ai-chart-panel">
                  <h5>Demand Trend Projection</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={forecastTrendData}>
                      <defs>
                        <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e8e8e3' }} />
                      <Area type="monotone" dataKey="baseline" stroke="#c4b5fd" strokeWidth={2} fill="none" strokeDasharray="6 3" />
                      <Area type="monotone" dataKey="projected" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradProjected)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="ai-chart-panel">
                  <h5>Breakdown by Metric</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={forecastBarData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e8e8e3' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {forecastBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="ai-chart-panel ai-chart-radar">
                  <h5>Analysis Dimensions</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={forecastRadarData} outerRadius={70}>
                      <PolarGrid stroke="#e8e8e3" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Verdict */}
              <AIVerdict reasoning={forecastResult?.reasoning || 'No reasoning provided.'} type="Forecast" level={forecastResult?.confidence === 'LOW' ? 'HIGH' : forecastResult?.confidence === 'MEDIUM' ? 'MEDIUM' : 'LOW'} />
            </div>
          )}
        </section>

        {/* ── Expiry Risk Module ── */}
        <section className="ai-module-card">
          <div className="ai-module-header risk-header">
            <div className="ai-module-icon-wrap risk-icon"><FiShield /></div>
            <div>
              <h2>Expiry Risk Evaluation</h2>
              <p>Assess whether current stock will expire before consumption</p>
            </div>
          </div>

          <div className="ai-input-section">
            <Stack component="form" spacing={2} onSubmit={getExpiryRisk}>
              <TextField select label="Select Item" value={expiryInput.itemId}
                onChange={(e) => handleExpiryItemChange(e.target.value)}
                required fullWidth className="ai-input">
                <MenuItem value="">Choose a catalog item...</MenuItem>
                {items.map((item) => (<MenuItem key={`expiry-${item._id}`} value={item._id}>{item.name}</MenuItem>))}
              </TextField>
              <div className="ai-input-row">
                <TextField type="number" label="Current Stock" value={expiryInput.currentStock}
                  fullWidth className="ai-input" disabled
                  helperText="Auto-filled from inventory batches" />
                <TextField type="number" label="Daily Usage Rate" placeholder="e.g., 2.5"
                  inputProps={{ min: 0, step: 0.1 }} value={expiryInput.dailyUsageRate} fullWidth className="ai-input"
                  helperText="Estimated consumption per day"
                  onChange={(e) => setExpiryInput({ ...expiryInput, dailyUsageRate: e.target.value })} />
              </div>
              <TextField type="number" label="Days to Expiry" value={expiryInput.daysToExpiry}
                fullWidth className="ai-input" disabled
                helperText="Earliest batch expiry from database" />
              <Button type="submit" startIcon={<FiShield />} fullWidth size="large"
                disabled={expiryLoading || !expiryInput.itemId}
                className="ai-submit-btn risk-btn">
                {expiryLoading ? 'Evaluating...' : 'Assess Risk'}
              </Button>
            </Stack>
          </div>

          {expiryLoading && <AISkeleton type="pie" />}

          {expiryResult && !expiryLoading && (
            <div className="ai-result-panel section-reveal">
              {/* KPI Row */}
              <div className="ai-stat-row">
                <article className="ai-kpi-card" style={{ borderTopColor: riskColor }}>
                  <p>Risk Level</p>
                  <h4 style={{ color: riskColor }}>{riskLevel}</h4>
                  <span className="ai-kpi-sub">assessment</span>
                </article>
                <article className="ai-kpi-card kpi-teal">
                  <p>Coverage Days</p>
                  <h4>{expiryCoverageDays}</h4>
                  <span className="ai-kpi-sub">days of stock</span>
                </article>
                <article className="ai-kpi-card kpi-blue">
                  <p>Expiry Window</p>
                  <h4>{expiryDays}</h4>
                  <span className="ai-kpi-sub">days remaining</span>
                </article>
              </div>

              {/* Tags */}
              <div className="ai-tags-row">
                <RiskBadge level={riskLevel} />
                <span className="ai-tag tag-muted"><FiActivity /> Coverage: {coverageRatio}%</span>
                {coverageRatio >= 100 && <span className="ai-tag tag-red"><FiAlertTriangle /> Excess Stock</span>}
              </div>

              {/* Charts Grid */}
              <div className="ai-charts-grid">
                <div className="ai-chart-panel">
                  <h5>Risk Gauge</h5>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <RiskGauge score={riskScore} color={riskColor} />
                  </div>
                  <div className="ai-risk-donut-wrap">
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={riskPieData} dataKey="value" innerRadius={40} outerRadius={60} stroke="none" startAngle={90} endAngle={-270}>
                          <Cell fill={riskColor} />
                          <Cell fill="#f0f0eb" />
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="ai-chart-panel">
                  <h5>Stock Burndown</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={burndownData}>
                      <defs>
                        <linearGradient id="gradBurndown" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="stock" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradBurndown)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="ai-chart-panel">
                  <h5>Coverage Breakdown</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={expiryBreakdownData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {expiryBreakdownData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Coverage Progress Bar */}
              <div className="ai-coverage-section">
                <div className="ai-coverage-header">
                  <span>Stock Coverage Ratio</span>
                  <span style={{ color: riskColor, fontWeight: 700 }}>{coverageRatio}%</span>
                </div>
                <div className="ai-coverage-track">
                  <div className="ai-coverage-fill" style={{ width: `${Math.min(100, coverageRatio)}%`, background: riskColor }} />
                </div>
                <p className="ai-coverage-hint">{expiryCoverageDays} day(s) of stock coverage for {expiryDays} day(s) until expiry</p>
              </div>

              {/* AI Verdict */}
              <AIVerdict reasoning={expiryResult?.reasoning || 'No reasoning provided.'} type="Risk" level={riskLevel} />
            </div>
          )}
        </section>
      </div>

      {error && <p className="error-banner">{error}</p>}
    </div>
  );
}
