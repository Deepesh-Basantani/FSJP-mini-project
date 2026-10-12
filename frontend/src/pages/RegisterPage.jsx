import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, UserPlus, AlertCircle, Building2, Users, Truck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function RegisterPage() {
  const [role, setRole] = useState('FOOD_PROVIDER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name,
        email,
        password,
        role,
        phone,
        organisationName: organisationName || name
      });

      login(res.token, res.user);

      if (res.user.role === 'FOOD_PROVIDER') {
        navigate('/provider/dashboard');
      } else if (res.user.role === 'NGO') {
        navigate('/ngo/dashboard');
      } else if (res.user.role === 'VOLUNTEER') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/donations');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      maxWidth: '560px',
      margin: '40px auto',
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
            Join Food Rescue
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
            Choose your role to get started
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setRole('FOOD_PROVIDER')}
            style={{
              padding: '12px 8px',
              border: `2px solid ${role === 'FOOD_PROVIDER' ? 'var(--primary-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: role === 'FOOD_PROVIDER' ? 'var(--soft-mint)' : 'var(--surface-white)',
              color: role === 'FOOD_PROVIDER' ? 'var(--primary-green)' : 'var(--main-text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <Building2 size={20} />
            <span>Food Provider</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('NGO')}
            style={{
              padding: '12px 8px',
              border: `2px solid ${role === 'NGO' ? 'var(--primary-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: role === 'NGO' ? 'var(--soft-mint)' : 'var(--surface-white)',
              color: role === 'NGO' ? 'var(--primary-green)' : 'var(--main-text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <Users size={20} />
            <span>NGO / Receiver</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('VOLUNTEER')}
            style={{
              padding: '12px 8px',
              border: `2px solid ${role === 'VOLUNTEER' ? 'var(--primary-green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: role === 'VOLUNTEER' ? 'var(--soft-mint)' : 'var(--surface-white)',
              color: role === 'VOLUNTEER' ? 'var(--primary-green)' : 'var(--main-text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <Truck size={20} />
            <span>Volunteer</span>
          </button>
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
            label={role === 'VOLUNTEER' ? 'Full Name' : 'Contact Person Name'}
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Maya Sharma"
          />

          {role !== 'VOLUNTEER' && (
            <Input
              label="Organisation / Business Name"
              id="reg-org"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              required
              placeholder={role === 'FOOD_PROVIDER' ? 'e.g. Green Bistro Restaurant' : 'e.g. Hope Community Kitchen'}
            />
          )}

          <Input
            label="Email Address"
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. contact@organisation.org"
          />

          <Input
            label="Phone Number"
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <Input
            label="Password (min 6 characters)"
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <p style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginBottom: '16px', lineHeight: 1.4 }}>
            * Providers and NGOs require verification before coordinating large batch distributions to ensure accountability and food safety.
          </p>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            <UserPlus size={18} /> Complete Registration
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--muted-text)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
