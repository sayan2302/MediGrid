import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';

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
      <TableCard title="System Alerts">
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
                    <button onClick={() => resolve(alert._id)} className="small-btn">
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
