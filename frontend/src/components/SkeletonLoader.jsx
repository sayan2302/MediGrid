/**
 * Reusable skeleton shimmer components for loading states.
 */

export function SkeletonLine({ width = '100%', height = '14px', style = {} }) {
  return (
    <div
      className="skeleton-line"
      style={{ width, height, borderRadius: '6px', ...style }}
    />
  );
}

export function SkeletonCard({ lines = 3, style = {} }) {
  return (
    <div className="skeleton-card" style={style}>
      <div className="skeleton-card-top">
        <div className="skeleton-circle" />
        <SkeletonLine width="60%" height="12px" />
      </div>
      <SkeletonLine width="45%" height="28px" style={{ marginTop: '12px' }} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={`${70 + Math.random() * 30}%`}
          height="10px"
          style={{ marginTop: '8px' }}
        />
      ))}
    </div>
  );
}

export function SkeletonMetricsRow({ count = 4 }) {
  return (
    <div className="metrics-grid skeleton-metrics-row">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart-box">
      <div className="skeleton-chart-bars">
        {[65, 40, 80, 55, 72, 35, 60, 48, 75, 42].map((h, i) => (
          <div
            key={i}
            className="skeleton-bar"
            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <SkeletonLine width="100%" height="2px" style={{ marginTop: '8px', opacity: 0.3 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <SkeletonLine width="30px" height="8px" />
        <SkeletonLine width="30px" height="8px" />
        <SkeletonLine width="30px" height="8px" />
        <SkeletonLine width="30px" height="8px" />
      </div>
    </div>
  );
}

export function SkeletonPins({ count = 6 }) {
  return (
    <div className="pin-wall">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-pin">
          <SkeletonLine width="70%" height="16px" />
          <SkeletonLine width="40%" height="10px" style={{ marginTop: '8px' }} />
          <SkeletonLine width="90%" height="10px" style={{ marginTop: '6px' }} />
        </div>
      ))}
    </div>
  );
}
