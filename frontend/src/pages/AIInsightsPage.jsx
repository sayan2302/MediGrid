import { useState } from 'react';
import { FiCpu, FiTrendingUp } from 'react-icons/fi';
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
          <form className="form-grid" onSubmit={getForecast}>
            <label>
              Item
              <select
                value={forecastInput.itemId}
                onChange={(event) => setForecastInput({ ...forecastInput, itemId: event.target.value })}
                required
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Horizon Days
              <input
                type="number"
                min="1"
                value={forecastInput.horizonDays}
                onChange={(event) => setForecastInput({ ...forecastInput, horizonDays: event.target.value })}
              />
            </label>
            <button type="submit">
              <FiTrendingUp />
              Generate Forecast
            </button>
          </form>
        )}

        {forecastResult ? <pre className="result-box">{JSON.stringify(forecastResult, null, 2)}</pre> : null}
      </section>

      <section className="form-card pin-card">
        <header className="section-head">
          <h3>Expiry Risk Evaluation</h3>
          <p>Estimate whether current stock is likely to expire before use.</p>
        </header>

        <form className="form-grid" onSubmit={getExpiryRisk}>
          <label>
            Item Name
            <input
              value={expiryInput.itemName}
              onChange={(event) => setExpiryInput({ ...expiryInput, itemName: event.target.value })}
              required
            />
          </label>
          <label>
            Current Stock
            <input
              type="number"
              min="0"
              value={expiryInput.currentStock}
              onChange={(event) => setExpiryInput({ ...expiryInput, currentStock: event.target.value })}
            />
          </label>
          <label>
            Daily Usage Rate
            <input
              type="number"
              min="0"
              step="0.1"
              value={expiryInput.dailyUsageRate}
              onChange={(event) => setExpiryInput({ ...expiryInput, dailyUsageRate: event.target.value })}
            />
          </label>
          <label>
            Days to Expiry
            <input
              type="number"
              min="1"
              value={expiryInput.daysToExpiry}
              onChange={(event) => setExpiryInput({ ...expiryInput, daysToExpiry: event.target.value })}
            />
          </label>
          <button type="submit">
            <FiCpu />
            Assess Risk
          </button>
        </form>

        {expiryResult ? <pre className="result-box">{JSON.stringify(expiryResult, null, 2)}</pre> : null}
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
    </div>
  );
}
