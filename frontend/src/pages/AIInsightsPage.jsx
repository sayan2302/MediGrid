import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import EmptyState from '../components/EmptyState';

export default function AIInsightsPage() {
  const { items } = useAppData();
  const [forecastInput, setForecastInput] = useState({ itemId: '', horizonDays: 14 });
  const [expiryInput, setExpiryInput] = useState({
    itemName: '',
    currentStock: 0,
    dailyUsageRate: 1,
    daysToExpiry: 30
  });
  const [forecastResult, setForecastResult] = useState(null);
  const [expiryResult, setExpiryResult] = useState(null);
  const [error, setError] = useState('');

  const horizonDays = Number(forecastInput.horizonDays || 0);
  const predictedDemand = Number(forecastResult?.predictedDemand || 0);
  const avgDailyDemand = horizonDays > 0 ? Number((predictedDemand / horizonDays).toFixed(2)) : 0;

  const forecastChartData = [
    { name: 'Predicted Total', value: predictedDemand },
    { name: 'Avg / Day', value: avgDailyDemand }
  ];

  const expiryCoverageDays =
    Number(expiryInput.dailyUsageRate) > 0 ? Number((Number(expiryInput.currentStock) / Number(expiryInput.dailyUsageRate)).toFixed(2)) : 0;
  const expiryDays = Number(expiryInput.daysToExpiry || 0);
  const riskLevel = expiryResult?.riskLevel || 'UNKNOWN';
  const riskScore = riskLevel === 'HIGH' ? 90 : riskLevel === 'MEDIUM' ? 60 : riskLevel === 'LOW' ? 30 : 0;
  const riskColor = riskLevel === 'HIGH' ? '#e60023' : riskLevel === 'MEDIUM' ? '#c47400' : '#103c25';
  const riskChartData = [
    { name: 'Risk', value: riskScore },
    { name: 'Remaining', value: 100 - riskScore }
  ];

  const getForecast = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const response = await api.post('/ai/forecast-demand', {
        itemId: forecastInput.itemId,
        horizonDays: Number(forecastInput.horizonDays)
      });
      setForecastResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const getExpiryRisk = async (event) => {
    event.preventDefault();
    try {
      setError('');
      const response = await api.post('/ai/expiry-risk', {
        ...expiryInput,
        currentStock: Number(expiryInput.currentStock),
        dailyUsageRate: Number(expiryInput.dailyUsageRate),
        daysToExpiry: Number(expiryInput.daysToExpiry)
      });
      setExpiryResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="page-grid two-col">
      <section className="form-card pin-card">
        <header className="section-head">
          <h3>Demand Forecast</h3>
          <p>Prompt-based estimate for future consumption over a custom horizon.</p>
        </header>

        {items.length === 0 ? (
          <EmptyState
            icon={<FiTrendingUp />}
            title="No item data for forecasting"
            description="Add inventory items or load demo data first, then return to generate forecasts."
          />
        ) : (
          <div className="ai-form-shell">
            <Stack component="form" spacing={1.6} onSubmit={getForecast} className="ai-form-stack">
              <TextField
                select
                label="Item"
                value={forecastInput.itemId}
                onChange={(event) => setForecastInput({ ...forecastInput, itemId: event.target.value })}
                required
              >
                <MenuItem value="">Select item</MenuItem>
                {items.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Horizon Days"
                inputProps={{ min: 1 }}
                value={forecastInput.horizonDays}
                onChange={(event) => setForecastInput({ ...forecastInput, horizonDays: event.target.value })}
              />
              <Button type="submit" startIcon={<FiTrendingUp />} fullWidth size="large">
                Generate Forecast
              </Button>
            </Stack>
          </div>
        )}

        {forecastResult ? (
          <section className="ai-visual-block">
            <div className="ai-stat-grid">
              <article className="ai-stat-card">
                <p>Predicted Demand</p>
                <h4>{predictedDemand}</h4>
              </article>
              <article className="ai-stat-card">
                <p>Avg Daily Demand</p>
                <h4>{avgDailyDemand}</h4>
              </article>
              <article className="ai-stat-card">
                <p>Confidence</p>
                <h4>{forecastResult?.confidence || 'N/A'}</h4>
              </article>
            </div>
            <div className="ai-chart-box">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#e60023" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="ai-reasoning">{forecastResult?.reasoning || 'No reasoning provided.'}</p>
          </section>
        ) : null}
      </section>

      <section className="form-card pin-card">
        <header className="section-head">
          <h3>Expiry Risk Evaluation</h3>
          <p>Estimate whether current stock is likely to expire before use.</p>
        </header>

        <div className="ai-form-shell">
          <Stack component="form" spacing={1.6} onSubmit={getExpiryRisk} className="ai-form-stack">
            <TextField
              label="Item Name"
              value={expiryInput.itemName}
              onChange={(event) => setExpiryInput({ ...expiryInput, itemName: event.target.value })}
              required
            />
            <TextField
              type="number"
              label="Current Stock"
              inputProps={{ min: 0 }}
              value={expiryInput.currentStock}
              onChange={(event) => setExpiryInput({ ...expiryInput, currentStock: event.target.value })}
            />
            <TextField
              type="number"
              label="Daily Usage Rate"
              inputProps={{ min: 0, step: 0.1 }}
              value={expiryInput.dailyUsageRate}
              onChange={(event) => setExpiryInput({ ...expiryInput, dailyUsageRate: event.target.value })}
            />
            <TextField
              type="number"
              label="Days to Expiry"
              inputProps={{ min: 1 }}
              value={expiryInput.daysToExpiry}
              onChange={(event) => setExpiryInput({ ...expiryInput, daysToExpiry: event.target.value })}
            />
            <Button type="submit" startIcon={<FiCpu />} fullWidth size="large">
              Assess Risk
            </Button>
          </Stack>
        </div>

        {expiryResult ? (
          <section className="ai-visual-block">
            <div className="ai-stat-grid">
              <article className="ai-stat-card">
                <p>Risk Level</p>
                <h4 style={{ color: riskColor }}>{riskLevel}</h4>
              </article>
              <article className="ai-stat-card">
                <p>Coverage Days</p>
                <h4>{expiryCoverageDays}</h4>
              </article>
              <article className="ai-stat-card">
                <p>Days to Expiry</p>
                <h4>{expiryDays}</h4>
              </article>
            </div>

            <div className="ai-chart-box">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={riskChartData} dataKey="value" innerRadius={50} outerRadius={85} stroke="none">
                    <Cell fill={riskColor} />
                    <Cell fill="#ecece8" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="ai-comparison-track">
              <div
                className="ai-comparison-fill"
                style={{ width: `${Math.min(100, Math.max(0, expiryDays ? (expiryCoverageDays / expiryDays) * 100 : 0))}%` }}
              />
            </div>
            <p className="ai-caption">
              Coverage ratio: {expiryCoverageDays} day(s) of stock for {expiryDays} day(s) to expiry.
            </p>
            <p className="ai-reasoning">{expiryResult?.reasoning || 'No reasoning provided.'}</p>
          </section>
        ) : null}
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
    </div>
  );
}
