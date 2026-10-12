import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function PickupDashboard() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAssignedPickups();
      setPickups(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned pickups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (pickupId, nextStatus) => {
    setProcessingId(pickupId);
    setError('');
    try {
      await api.updatePickupStatus(pickupId, {
        status: nextStatus,
        note: `Volunteer marked pickup as ${nextStatus}`
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update pickup status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><LoadingState message="Loading assigned pickups..." /></div>;

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
          Volunteer Pickup Dashboard
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
          Manage your assigned surplus food collections, delivery progress, and handover confirmations.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: 'var(--error-red)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {pickups.length === 0 ? (
        <EmptyState
          title="No pickups assigned to you"
          description="When providers or administrators assign surplus food pickups to your volunteer account, they will appear here."
          icon={Truck}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pickups.map(pickup => (
            <div key={pickup.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <StatusBadge status={pickup.pickupStatus} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                      Pickup #{pickup.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--main-text)' }}>
                    {pickup.donationTitle}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '0.9rem', marginTop: '6px' }}>
                    <MapPin size={16} />
                    <span>{pickup.donationAddress}</span>
                  </div>

                  {pickup.pickupTime && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary-green)', marginTop: '6px' }}>
                      Collected: {new Date(pickup.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {pickup.deliveryTime && (
                    <p style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '4px' }}>
                      Delivered: {new Date(pickup.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {/* Progress Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {pickup.pickupStatus === 'ASSIGNED' && (
                    <Button
                      variant="primary"
                      loading={processingId === pickup.id}
                      onClick={() => handleUpdateStatus(pickup.id, 'COLLECTED')}
                    >
                      <Truck size={16} /> Mark as Collected
                    </Button>
                  )}

                  {pickup.pickupStatus === 'COLLECTED' && (
                    <Button
                      variant="primary"
                      loading={processingId === pickup.id}
                      onClick={() => handleUpdateStatus(pickup.id, 'DELIVERED')}
                    >
                      <CheckCircle2 size={16} /> Mark as Delivered
                    </Button>
                  )}

                  {pickup.pickupStatus === 'DELIVERED' && (
                    <span style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--soft-mint)',
                      color: 'var(--primary-green)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
