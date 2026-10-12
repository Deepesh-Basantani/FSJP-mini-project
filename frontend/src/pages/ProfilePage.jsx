import React, { useState } from 'react';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organisationName, setOrganisationName] = useState(user?.organisationName || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setUpdatingProfile(true);

    try {
      const updated = await api.updateProfile({ name, phone, organisationName });
      updateUser({ ...user, ...updated });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)', marginBottom: '8px' }}>
        Account & Profile Settings
      </h1>
      <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem', marginBottom: '32px' }}>
        Manage your contact details, organisation information, and security credentials.
      </p>

      {/* Account Info Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            Organisation Details
          </h3>
          <StatusBadge status={user?.verificationStatus} />
        </div>

        {profileMsg && (
          <div style={{ padding: '10px', backgroundColor: '#ecfdf5', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {profileMsg}
          </div>
        )}
        {profileError && (
          <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: 'var(--error-red)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <Input
            label="Full Name / Representative"
            id="prof-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Organisation Name"
            id="prof-org"
            value={organisationName}
            onChange={(e) => setOrganisationName(e.target.value)}
          />

          <div className="grid-2">
            <Input
              label="Email Address"
              id="prof-email"
              value={user?.email || ''}
              disabled
              helpText="Email cannot be changed directly"
            />

            <Input
              label="Phone Number"
              id="prof-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button type="submit" variant="primary" loading={updatingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '20px' }}>
          Change Password Securely
        </h3>

        {passwordMsg && (
          <div style={{ padding: '10px', backgroundColor: '#ecfdf5', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {passwordMsg}
          </div>
        )}
        {passwordError && (
          <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: 'var(--error-red)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <Input
            label="Current Password"
            id="old-pass"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="New Password (min 6 characters)"
            id="new-pass"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button type="submit" variant="outline" loading={changingPassword}>
              <Lock size={16} /> Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
