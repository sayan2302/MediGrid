import { FiAlertTriangle } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';

export default function AlertsPage() {
  const { alerts, fetchAll, setError } = useAppData();

  const resolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    }
  };

  return (
    <div className="page-grid">
      <TableCard title="System Alerts" subtitle="Severity-based notifications from stock and expiry monitors.">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<FiAlertTriangle />}
            title="No active alerts"
            description="This section populates when stock drops below threshold or batches near expiry."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td>{alert.type}</td>
                  <td>
                    <span className={`pill ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                  </td>
                  <td>{alert.message}</td>
                  <td>{new Date(alert.createdAt).toLocaleString()}</td>
                  <td>
                    {alert.resolved ? (
                      'Resolved'
                    ) : (
                      <button onClick={() => resolve(alert._id)} className="button-secondary">
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
