import { Link, NavLink } from 'react-router-dom';
import { FiAlertCircle, FiBarChart2, FiBox, FiCpu, FiLogIn, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: <FiBarChart2 /> },
  { to: '/inventory', label: 'Inventory', icon: <FiBox /> },
  { to: '/procurement', label: 'Procurement', icon: <FiShoppingBag /> },
  { to: '/alerts', label: 'Alerts', icon: <FiAlertCircle /> },
  { to: '/ai-insights', label: 'AI Insights', icon: <FiCpu /> }
];

export default function Layout({ children }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-row">
          <Link className="brand" to="/">
            <span className="brand-chip">M</span>
            MediGrid
          </Link>

          {isAuthenticated ? (
            <button type="button" className="button-secondary" onClick={logout}>
              <FiLogOut />
              Sign Out
            </button>
          ) : (
            <NavLink to="/login" className="button-secondary nav-as-button">
              <FiLogIn />
              Login
            </NavLink>
          )}
        </div>

        <nav className="tabbar">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `tablink ${isActive ? 'active' : ''}`}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="content">{children}</main>

      <footer className="footer-bar">
        <p>Built for hospital operations visibility, procurement discipline, and low-friction decisions.</p>
      </footer>
    </div>
  );
}
