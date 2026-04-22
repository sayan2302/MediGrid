import { useState } from 'react';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
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
    <section className="form-card login-card pin-card">
      <header className="section-head">
        <h2>Login</h2>
      </header>

      <Button
        type="button"
        className="google-btn"
        variant="outlined"
        onClick={onGoogleSignIn}
        disabled={loading}
        startIcon={<FcGoogle />}
      >
        {loading ? 'Please wait...' : 'Continue with Google'}
      </Button>

      <p className="auth-separator">or use email and password</p>

      <Stack component="form" spacing={1.2} onSubmit={onSubmit}>
        <TextField
          type="email"
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiMail />
              </InputAdornment>
            )
          }}
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          inputProps={{ minLength: 6 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiLock />
              </InputAdornment>
            )
          }}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>

      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}
