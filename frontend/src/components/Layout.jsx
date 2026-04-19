import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/procurement', label: 'Procurement' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/ai-insights', label: 'AI Insights' }
];

export default function Layout({ children }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">
          MediGrid
        </Link>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button type="button" className="ghost-btn" onClick={logout}>
              Sign Out
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
              Login
            </NavLink>
          )}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
