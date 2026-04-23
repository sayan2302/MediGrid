/**
 * Reusable page hero banner with gradient background, floating orbs, and badge.
 *
 * Props:
 *   badge       – label for the top badge  (e.g. "Real-Time Monitoring")
 *   badgeIcon   – React icon element       (e.g. <FiActivity />)
 *   title       – large heading text
 *   description – sub-text
 *   theme       – 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate'  (default: indigo)
 *   actions     – optional JSX for buttons
 */
const THEMES = {
  indigo: {
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #7c3aed 100%)',
    glow: 'rgba(139, 92, 246, 0.4)',
    badge: '#c4b5fd',
    badgeBorder: 'rgba(196, 181, 253, 0.25)',
    badgeBg: 'rgba(255,255,255,0.15)',
    textGrad: 'linear-gradient(135deg, #fff 40%, #c4b5fd 100%)',
    sub: 'rgba(221, 214, 254, 0.85)',
    orb1: 'rgba(139, 92, 246, 0.2)',
    orb2: 'rgba(236, 72, 153, 0.2)',
    orb3: 'rgba(99, 102, 241, 0.25)',
  },
  emerald: {
    bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 30%, #065f46 60%, #10b981 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
    badge: '#6ee7b7',
    badgeBorder: 'rgba(110, 231, 183, 0.25)',
    badgeBg: 'rgba(255,255,255,0.12)',
    textGrad: 'linear-gradient(135deg, #fff 40%, #6ee7b7 100%)',
    sub: 'rgba(167, 243, 208, 0.8)',
    orb1: 'rgba(16, 185, 129, 0.2)',
    orb2: 'rgba(52, 211, 153, 0.18)',
    orb3: 'rgba(5, 150, 105, 0.22)',
  },
  rose: {
    bg: 'linear-gradient(135deg, #4c0519 0%, #881337 30%, #be123c 60%, #f43f5e 100%)',
    glow: 'rgba(244, 63, 94, 0.35)',
    badge: '#fda4af',
    badgeBorder: 'rgba(253, 164, 175, 0.3)',
    badgeBg: 'rgba(255,255,255,0.12)',
    textGrad: 'linear-gradient(135deg, #fff 40%, #fda4af 100%)',
    sub: 'rgba(254, 205, 211, 0.85)',
    orb1: 'rgba(244, 63, 94, 0.22)',
    orb2: 'rgba(251, 113, 133, 0.18)',
    orb3: 'rgba(225, 29, 72, 0.2)',
  },
  amber: {
    bg: 'linear-gradient(135deg, #451a03 0%, #78350f 30%, #92400e 60%, #f59e0b 100%)',
    glow: 'rgba(245, 158, 11, 0.35)',
    badge: '#fcd34d',
    badgeBorder: 'rgba(252, 211, 77, 0.3)',
    badgeBg: 'rgba(255,255,255,0.12)',
    textGrad: 'linear-gradient(135deg, #fff 40%, #fcd34d 100%)',
    sub: 'rgba(253, 230, 138, 0.85)',
    orb1: 'rgba(245, 158, 11, 0.22)',
    orb2: 'rgba(251, 191, 36, 0.18)',
    orb3: 'rgba(217, 119, 6, 0.2)',
  },
  slate: {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #64748b 100%)',
    glow: 'rgba(100, 116, 139, 0.35)',
    badge: '#cbd5e1',
    badgeBorder: 'rgba(203, 213, 225, 0.25)',
    badgeBg: 'rgba(255,255,255,0.1)',
    textGrad: 'linear-gradient(135deg, #fff 40%, #cbd5e1 100%)',
    sub: 'rgba(203, 213, 225, 0.8)',
    orb1: 'rgba(100, 116, 139, 0.2)',
    orb2: 'rgba(148, 163, 184, 0.18)',
    orb3: 'rgba(71, 85, 105, 0.22)',
  },
};

export default function PageBanner({ badge, badgeIcon, title, description, theme = 'indigo', actions }) {
  const t = THEMES[theme] || THEMES.indigo;

  return (
    <section className="page-banner" style={{ background: t.bg }}>
      <div className="page-banner-glow" style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)` }} />
      <div className="page-banner-content">
        <span className="page-banner-badge" style={{ color: t.badge, borderColor: t.badgeBorder, background: t.badgeBg }}>
          {badgeIcon} {badge}
        </span>
        <h1 style={{ background: t.textGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {title}
        </h1>
        <p style={{ color: t.sub }}>{description}</p>
        {actions && <div className="page-banner-actions">{actions}</div>}
      </div>
      <div className="page-banner-orbs">
        <div className="page-banner-orb orb-1" style={{ background: t.orb1 }} />
        <div className="page-banner-orb orb-2" style={{ background: t.orb2 }} />
        <div className="page-banner-orb orb-3" style={{ background: t.orb3 }} />
      </div>
    </section>
  );
}
