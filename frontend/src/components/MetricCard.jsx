export default function MetricCard({ label, value, hint }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <h3>{value}</h3>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
}
