import { useState } from 'react';
import api from '../api/client';
import { useAppData } from '../context/AppContext';

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

  const getForecast = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/ai/forecast-demand', {
        itemId: forecastInput.itemId,
        horizonDays: Number(forecastInput.horizonDays)
      });
      setForecastResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const getExpiryRisk = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/ai/expiry-risk', {
        ...expiryInput,
        currentStock: Number(expiryInput.currentStock),
        dailyUsageRate: Number(expiryInput.dailyUsageRate),
        daysToExpiry: Number(expiryInput.daysToExpiry)
      });
      setExpiryResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="page-grid two-col">
      <section className="form-card">
        <h3>Demand Forecast</h3>
        <form className="form-grid" onSubmit={getForecast}>
          <label>
            Item
            <select
              value={forecastInput.itemId}
              onChange={(e) => setForecastInput({ ...forecastInput, itemId: e.target.value })}
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
              onChange={(e) => setForecastInput({ ...forecastInput, horizonDays: e.target.value })}
            />
          </label>
          <button type="submit">Generate Forecast</button>
        </form>
        {forecastResult ? (
          <pre className="result-box">{JSON.stringify(forecastResult, null, 2)}</pre>
        ) : null}
      </section>

      <section className="form-card">
        <h3>Expiry Risk Evaluation</h3>
        <form className="form-grid" onSubmit={getExpiryRisk}>
          <label>
            Item Name
            <input
              value={expiryInput.itemName}
              onChange={(e) => setExpiryInput({ ...expiryInput, itemName: e.target.value })}
              required
            />
          </label>
          <label>
            Current Stock
            <input
              type="number"
              min="0"
              value={expiryInput.currentStock}
              onChange={(e) => setExpiryInput({ ...expiryInput, currentStock: e.target.value })}
            />
          </label>
          <label>
            Daily Usage Rate
            <input
              type="number"
              min="0"
              step="0.1"
              value={expiryInput.dailyUsageRate}
              onChange={(e) => setExpiryInput({ ...expiryInput, dailyUsageRate: e.target.value })}
            />
          </label>
          <label>
            Days to Expiry
            <input
              type="number"
              min="1"
              value={expiryInput.daysToExpiry}
              onChange={(e) => setExpiryInput({ ...expiryInput, daysToExpiry: e.target.value })}
            />
          </label>
          <button type="submit">Assess Risk</button>
        </form>
        {expiryResult ? <pre className="result-box">{JSON.stringify(expiryResult, null, 2)}</pre> : null}
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
    </div>
  );
}
