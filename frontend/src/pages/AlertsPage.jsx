import { useMemo, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';
import PageBanner from '../components/PageBanner';

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
      <PageBanner
        badge="Safety Monitoring"
        badgeIcon={<FiAlertTriangle />}
        title="Alert Command Center"
        description="Monitor low-stock warnings and expiry notifications generated from live inventory conditions."
        theme="rose"
        actions={
          <>
            <button type="button" onClick={recomputeAlerts} disabled={loading}>
              <FiRefreshCw />
              {loading ? 'Refreshing...' : 'Refresh Alerts'}
            </button>
            <span className="stat-chip" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Total: {stats.total}</span>
            <span className="stat-chip" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Unresolved: {stats.unresolved}</span>
            <span className="stat-chip" style={{ background: 'rgba(255,80,100,0.3)', color: '#fda4af', borderColor: 'rgba(253,164,175,0.3)' }}>Critical: {stats.critical}</span>
          </>
        }
      />

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
