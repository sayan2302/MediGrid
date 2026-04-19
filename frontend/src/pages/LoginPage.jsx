import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas">
      <section className="login-hero pin-card">
        <p className="kicker">MediGrid Authentication</p>
        <h1>Sign in to run inventory and procurement workflows.</h1>
        <p>Use Firebase Google sign in or your email/password account to continue.</p>
      </section>

      <section className="form-card login-card pin-card">
        <header className="section-head">
          <h3>Welcome back</h3>
          <p>Continue where your operations left off.</p>
        </header>

        <button type="button" className="google-btn" onClick={onGoogleSignIn} disabled={loading}>
          <FcGoogle />
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <p className="auth-separator">or use email and password</p>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Email
            <div className="icon-input">
              <FiMail />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </label>
          <label>
            Password
            <div className="icon-input">
              <FiLock />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
      </section>
    </div>
  );
}
