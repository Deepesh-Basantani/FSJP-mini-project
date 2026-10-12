import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, Bell, User, LogOut, Shield, Menu, X, Radio } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocketNotifications } from '../hooks/useSocketNotifications';
import { api } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { socketConnected, liveAlerts } = useSocketNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then(res => {
          if (Array.isArray(res)) {
            setUnreadCount(res.filter(n => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, liveAlerts]);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'FOOD_PROVIDER') return '/provider/dashboard';
    if (role === 'NGO') return '/ngo/dashboard';
    if (role === 'VOLUNTEER') return '/volunteer/dashboard';
    if (role === 'ADMINISTRATOR') return '/admin/dashboard';
    return '/';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      backgroundColor: 'var(--surface-white)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Brand / Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--primary-green)',
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em'
        }}>
          <div style={{
            backgroundColor: 'var(--soft-mint)',
            color: 'var(--primary-green)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HeartHandshake size={22} />
          </div>
          <span>Food Rescue</span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="nav-desktop">
          <Link
            to="/"
            style={{
              fontWeight: isActive('/') ? 600 : 500,
              color: isActive('/') ? 'var(--primary-green)' : 'var(--main-text)'
            }}
          >
            Home
          </Link>
          <Link
            to="/donations"
            style={{
              fontWeight: isActive('/donations') ? 600 : 500,
              color: isActive('/donations') ? 'var(--primary-green)' : 'var(--main-text)'
            }}
          >
            Find Food
          </Link>

          {role === 'FOOD_PROVIDER' && (
            <Link
              to="/donations/new"
              style={{
                fontWeight: isActive('/donations/new') ? 600 : 500,
                color: isActive('/donations/new') ? 'var(--primary-green)' : 'var(--main-text)'
              }}
            >
              Donate Food
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              style={{
                fontWeight: location.pathname.includes('dashboard') ? 600 : 500,
                color: location.pathname.includes('dashboard') ? 'var(--primary-green)' : 'var(--main-text)'
              }}
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/impact"
            style={{
              fontWeight: isActive('/impact') ? 600 : 500,
              color: isActive('/impact') ? 'var(--primary-green)' : 'var(--main-text)'
            }}
          >
            Impact
          </Link>

          <Link
            to="/help"
            style={{
              fontWeight: isActive('/help') ? 600 : 500,
              color: isActive('/help') ? 'var(--primary-green)' : 'var(--main-text)'
            }}
          >
            Help & Guidance
          </Link>
        </nav>

        {/* Right side actions / Account menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Real-time Companion status indicator */}
          <div
            title={socketConnected ? "Real-time Node.js notification companion connected" : "Companion service offline (polling fallback)"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: socketConnected ? 'var(--primary-green)' : 'var(--muted-text)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              background: socketConnected ? 'var(--soft-mint)' : '#f1f5f9'
            }}
          >
            <Radio size={12} style={{ animation: socketConnected ? 'pulse 2s infinite' : 'none' }} />
            <span className="live-status-text">{socketConnected ? 'Live' : 'Standby'}</span>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
              {/* Notification Bell */}
              <Link
                to="/notifications"
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '50%',
                  color: 'var(--main-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="View notifications"
              >
                <Bell size={20} />
                {(unreadCount > 0 || liveAlerts.length > 0) && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: 'var(--error-red)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount + liveAlerts.length}
                  </span>
                )}
              </Link>

              {/* Account Dropdown Trigger */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '8px', borderRadius: 'var(--radius-full)' }}
                  aria-expanded={userDropdown}
                  aria-label="User menu"
                >
                  <User size={16} />
                  <span>{user.name?.split(' ')[0]}</span>
                </button>

                {userDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '120%',
                    width: '220px',
                    backgroundColor: 'var(--surface-white)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '8px',
                    zIndex: 200
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>{user.role}</p>
                      {user.organisationName && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary-green)' }}>{user.organisationName}</p>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        color: 'var(--main-text)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <User size={15} />
                      <span>Profile & Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        color: 'var(--error-red)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
