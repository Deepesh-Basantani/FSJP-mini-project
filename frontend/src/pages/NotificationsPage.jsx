import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Radio, CheckCheck } from 'lucide-react';
import { api } from '../services/api';
import { useSocketNotifications } from '../hooks/useSocketNotifications';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socketConnected, liveAlerts } = useSocketNotifications();

  const loadNotifications = () => {
    setLoading(true);
    api.getNotifications()
      .then(res => {
        setNotifications(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, [liveAlerts]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px', maxWidth: '820px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            Notifications & Alerts
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
            Live status updates for requests, approvals, and collection reminders.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: socketConnected ? 'var(--soft-mint)' : '#f1f5f9',
          color: socketConnected ? 'var(--primary-green)' : 'var(--muted-text)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <Radio size={14} />
          <span>{socketConnected ? 'Node.js Socket.IO Connected' : 'Polling Sync Mode'}</span>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications right now"
          description="You're all caught up! You'll receive updates when donations are requested, approved or handed over."
          icon={Bell}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: n.isRead ? 'var(--surface-white)' : '#f6fbf8',
                borderLeft: n.isRead ? '1px solid var(--border)' : '4px solid var(--primary-green)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary-green)'
                  }}>
                    {n.type}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--main-text)', fontWeight: n.isRead ? 400 : 600 }}>
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <Button variant="outline" size="sm" onClick={() => handleMarkRead(n.id)}>
                  <Check size={14} /> Mark as read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
