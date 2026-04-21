import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { animate } from 'motion';
import { AnimatePresence, motion } from 'motion/react';
import {
  FiAlertCircle,
  FiBarChart2,
  FiBox,
  FiCpu,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiShoppingBag
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import ProfileAvatar from './ProfileAvatar';

const links = [
  { to: '/', label: 'Dashboard', icon: <FiBarChart2 /> },
  { to: '/inventory', label: 'Inventory', icon: <FiBox /> },
  { to: '/procurement', label: 'Procurement', icon: <FiShoppingBag /> },
  { to: '/alerts', label: 'Alerts', icon: <FiAlertCircle /> },
  { to: '/ai-insights', label: 'AI Insights', icon: <FiCpu /> }
];

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { customProfileImage } = usePreferences();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarName = user?.displayName || user?.email?.split('@')[0] || 'MediGrid User';
  const avatarSrc = customProfileImage || user?.photoURL || '';

  useEffect(() => {
    const onClick = (event) => {
      const source = event.target;
      if (!(source instanceof Element)) return;
      const target = source.closest('button, .sidebar-link, .sidebar-auth-btn, .profile-menu-trigger');
      if (!target) return;
      animate(target, { transform: ['scale(1)', 'scale(0.97)', 'scale(1)'] }, { duration: 0.22, easing: 'ease-out' });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <motion.section
          className="auth-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link className="brand auth-brand" to="/login">
            <span className="brand-chip">M</span>
            <span className="brand-word">MediGrid</span>
          </Link>
          <h1>
            Smart stock.
            <br />
            Safer care.
          </h1>
          <p>Sign in to run inventory, procurement, and AI-driven safety workflows in one place.</p>
        </motion.section>

        <motion.section
          className="auth-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>
    );
  }

  return (
    <div className={`shell shell-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button type="button" className="mobile-sidebar-toggle" onClick={() => setMobileOpen((prev) => !prev)}>
        <FiMenu />
      </button>

      <motion.aside
        className="sidebar pin-card"
        initial={{ x: -14, opacity: 0.72 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sidebar-head">
          <Link className="brand" to="/" onClick={closeMobileMenu}>
            <span className="brand-chip">M</span>
            <span className="brand-word">MediGrid</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {links.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.045 + 0.08, duration: 0.3 }}
            >
              <NavLink
                to={link.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-foot">
          {isAuthenticated ? (
            <div className="sidebar-account">
              <div className="profile-menu-trigger" aria-label="Logged in account">
                <ProfileAvatar src={avatarSrc} name={avatarName} size={36} />
                <div className="profile-menu-user">
                  <p>{avatarName}</p>
                  <span>Logged in</span>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-auth-btn"
                onClick={() => {
                  closeMobileMenu();
                  logout();
                }}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </motion.aside>

      <main className="content">
        <div className="content-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <button type="button" className="sidebar-overlay" onClick={closeMobileMenu} aria-label="Close sidebar" />
    </div>
  );
}
