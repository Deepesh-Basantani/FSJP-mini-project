import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);

      // Redirect by role
      if (res.user.role === 'FOOD_PROVIDER') {
        navigate('/provider/dashboard');
      } else if (res.user.role === 'NGO') {
        navigate('/ngo/dashboard');
      } else if (res.user.role === 'VOLUNTEER') {
        navigate('/volunteer/dashboard');
      } else if (res.user.role === 'ADMINISTRATOR') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="container" style={{
      maxWidth: '460px',
      margin: '48px auto',
      padding: '0 var(--space-16)'
    }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            backgroundColor: 'var(--soft-mint)',
            color: 'var(--primary-green)',
            borderRadius: '50%',
            marginBottom: '12px'
          }}>
            <HeartHandshake size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            Sign In to Food Rescue
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
            Coordinate surplus food sharing securely
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--error-red)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. provider@greenbistro.com"
          />

          <Input
            label="Password"
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
          >
            <LogIn size={18} /> Sign In
          </Button>
        </form>

        {/* Demo Fast-Login Helpers */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '8px' }}>
            Quick Demo Accounts (Password: password123):
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('provider@greenbistro.com')}
            >
              Food Provider
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('ngo@hopekitchen.org')}
            >
              Verified NGO
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('volunteer@foodrescue.org')}
            >
              Volunteer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fillDemo('admin@foodrescue.org')}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--muted-text)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
