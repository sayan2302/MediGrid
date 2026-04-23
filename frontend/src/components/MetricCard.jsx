import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

export default function MetricCard({ label, value, hint, icon, tone = 'warm', tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <p className="metric-label">{label}</p>
        {tooltip ? (
          <span
            className="metric-info-trigger"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <FiInfo size={14} />
            {showTooltip && (
              <div className="metric-tooltip">
                <strong>{tooltip.title || label}</strong>
                {tooltip.description && <p>{tooltip.description}</p>}
                {tooltip.formula && (
                  <code className="metric-tooltip-formula">{tooltip.formula}</code>
                )}
              </div>
            )}
          </span>
        ) : null}
      </div>
      <h3>{value}</h3>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
}
