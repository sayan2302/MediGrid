export default function MetricCard({ label, value, hint, icon, tone = 'warm' }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <p className="metric-label">{label}</p>
      </div>
      <h3>{value}</h3>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
}
