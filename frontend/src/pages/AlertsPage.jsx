import { useMemo, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';

const formatAlertType = (type) =>
  type
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');

export default function AlertsPage() {
  const { alerts, fetchAll, setError } = useAppData();
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const unresolved = alerts.filter((alert) => !alert.resolved).length;
    const critical = alerts.filter((alert) => !alert.resolved && alert.severity === 'CRITICAL').length;
    return {
      total: alerts.length,
      unresolved,
      critical
    };
  }, [alerts]);

  const recomputeAlerts = async () => {
    setLoading(true);
    try {
      await api.post('/alerts/recompute');
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const resolve = async (id) => {
    setLoading(true);
    try {
      await api.patch(`/alerts/${id}/resolve`);
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="pin-card form-card">
        <header className="section-head">
          <h3>Alert Controls</h3>
          <p>Recompute alerts from live stock and expiry rules whenever needed.</p>
        </header>
        <div className="row-actions">
          <button type="button" onClick={recomputeAlerts} disabled={loading}>
            <FiRefreshCw />
            {loading ? 'Refreshing...' : 'Refresh / Generate Alerts'}
          </button>
          <span className="stat-chip">Total: {stats.total}</span>
          <span className="stat-chip">Unresolved: {stats.unresolved}</span>
          <span className="stat-chip critical-chip">Critical: {stats.critical}</span>
        </div>
      </section>

      <TableCard title="System Alerts" subtitle="Severity-based notifications from stock and expiry monitors.">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<FiAlertTriangle />}
            title="No active alerts"
            description="Click Refresh / Generate Alerts to evaluate low-stock and expiry conditions now."
            action={
              <button type="button" onClick={recomputeAlerts} disabled={loading}>
                <FiRefreshCw />
                Generate Alerts
              </button>
            }
          />
        ) : (
          <div className="alert-feed">
            {alerts.map((alert) => (
              <article
                key={alert._id}
                className={`alert-card severity-${alert.severity.toLowerCase()} ${alert.resolved ? 'is-resolved' : ''}`}
              >
                <div className="alert-top">
                  <h4>{formatAlertType(alert.type)}</h4>
                  <span className={`pill ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                </div>

                <p className="alert-message">{alert.message}</p>

                <div className="alert-meta">
                  <span className="stat-chip">{new Date(alert.createdAt).toLocaleString()}</span>
                  <span className={`stat-chip ${alert.resolved ? '' : 'critical-chip'}`}>
                    {alert.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>

                {!alert.resolved ? (
                  <div className="compact-actions">
                    <button onClick={() => resolve(alert._id)} className="button-secondary">
                      Resolve
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </TableCard>
    </div>
  );
}
