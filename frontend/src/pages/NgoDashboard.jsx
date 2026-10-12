import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Clock, X, AlertTriangle, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await api.getMyReservations();
      setReservations(Array.isArray(res) ? res : []);
    } catch (err) {
      setActionError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    setProcessingId(reservationId);
    setActionError('');
    try {
      await api.cancelReservation(reservationId);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to cancel request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmHandover = async (pickupId) => {
    setProcessingId(pickupId);
    setActionError('');
    try {
      await api.confirmHandover(pickupId);
      alert('Handover receipt confirmed! If provider also confirmed, this donation is now COMPLETED.');
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Handover confirmation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><LoadingState message="Loading NGO dashboard..." /></div>;

  const isVerified = user?.verificationStatus === 'VERIFIED';
  const activeReservations = reservations.filter(r => r.status === 'PENDING' || r.status === 'APPROVED');
  const pastReservations = reservations.filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED' || r.status === 'CANCELLED');

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px' }}>
      {/* Verification Alert Banner */}
      {!isVerified && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={24} style={{ color: 'var(--warning-amber)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e' }}>
              Organisation Verification Pending
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#b45309' }}>
              Your account is currently under administrative verification. In accordance with safety policies, you can browse listings preview, but reservations will unlock upon approval.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            NGO & Receiver Dashboard
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
            Track requested surplus food, pickup details, and confirm receipts.
          </p>
        </div>

        <Link to="/donations" className="btn btn-primary btn-lg">
          Browse Surplus Food <ArrowRight size={18} />
        </Link>
      </div>

      {actionError && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: 'var(--error-red)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '24px'
        }}>
          {actionError}
        </div>
      )}

      {/* Section 1: Active Requests & Scheduled Pickups */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '16px' }}>
          Active Requests & Scheduled Collections ({activeReservations.length})
        </h2>

        {activeReservations.length === 0 ? (
          <EmptyState
            title="No active food requests"
            description="You don't have any ongoing surplus food reservations right now."
            actionLabel="Find Food to Request"
            onAction={() => window.location.href = '/donations'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeReservations.map(res => {
              const pickup = res.pickup;
              const providerConfirmed = pickup?.handoverConfirmedByProvider;
              const receiverConfirmed = pickup?.handoverConfirmedByReceiver;

              return (
                <div key={res.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <StatusBadge status={res.status} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                          Requested {new Date(res.requestedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text)' }}>
                        <Link to={`/donations/${res.donationId}`} style={{ color: 'inherit' }}>
                          {res.donationTitle}
                        </Link>
                      </h3>

                      <p style={{ fontSize: '0.95rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                        Provider: <strong>{res.providerOrganisation || res.providerName}</strong>
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ color: 'var(--muted-text)' }}>Requested Quantity: </span>
                          <strong style={{ color: 'var(--primary-green)' }}>{res.quantityRequested} {res.donationUnit}</strong>
                        </div>

                        {res.donationAddress && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={16} style={{ color: 'var(--muted-text)' }} />
                            <span>{res.donationAddress}</span>
                          </div>
                        )}
                      </div>

                      {res.status === 'APPROVED' && pickup && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px 16px',
                          backgroundColor: 'var(--soft-mint)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}>
                          <p style={{ fontWeight: 600, color: 'var(--primary-green)', marginBottom: '4px' }}>
                            Pickup & Handover Status:
                          </p>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            <span>Provider Sent: {providerConfirmed ? '✅ Confirmed' : '⏳ Pending'}</span>
                            <span>Receiver Receipt: {receiverConfirmed ? '✅ Confirmed' : '⏳ Pending'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                      {res.status === 'APPROVED' && pickup && !receiverConfirmed && (
                        <Button
                          variant="primary"
                          loading={processingId === pickup.id}
                          onClick={() => handleConfirmHandover(pickup.id)}
                        >
                          <PackageCheck size={18} /> Confirm Handover Received
                        </Button>
                      )}

                      {res.status === 'PENDING' && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={processingId === res.id}
                          onClick={() => handleCancel(res.id)}
                        >
                          <X size={16} /> Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Completed / Historical Reservations */}
      <section>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '16px' }}>
          Past & Completed Reservations ({pastReservations.length})
        </h2>

        {pastReservations.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
            No past donation history yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pastReservations.map(res => (
              <div key={res.id} className="card" style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={res.status} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                      {new Date(res.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{res.donationTitle}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                    {res.quantityRequested} {res.donationUnit} from {res.providerOrganisation || res.providerName}
                  </p>
                </div>
                <Link to={`/donations/${res.donationId}`} className="btn btn-outline btn-sm">
                  View Listing
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
