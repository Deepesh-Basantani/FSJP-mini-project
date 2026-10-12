import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Check, X, ShieldCheck, Clock, Users, PackageCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function ProviderDashboard() {
  const [myDonations, setMyDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        api.getMyDonations(),
        api.getMyReservations()
      ]);
      setMyDonations(Array.isArray(donationsRes) ? donationsRes : []);
      setIncomingRequests(Array.isArray(requestsRes) ? requestsRes : []);
    } catch (err) {
      setActionError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (reservationId) => {
    setProcessingId(reservationId);
    setActionError('');
    try {
      await api.approveReservation(reservationId);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reservationId) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    setProcessingId(reservationId);
    setActionError('');
    try {
      await api.rejectReservation(reservationId);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmHandover = async (pickupId) => {
    setProcessingId(pickupId);
    setActionError('');
    try {
      await api.confirmHandover(pickupId);
      alert('Handover confirmed on your side! When the receiver also confirms, the donation will be marked COMPLETED.');
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Handover confirmation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><LoadingState message="Loading provider dashboard..." /></div>;

  const pendingRequests = incomingRequests.filter(r => r.status === 'PENDING');
  const approvedRequests = incomingRequests.filter(r => r.status === 'APPROVED');
  const completedRequests = incomingRequests.filter(r => r.status === 'COMPLETED');

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            Provider Dashboard
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
            Manage surplus food listings, review requests, and confirm food handovers.
          </p>
        </div>

        <Link to="/donations/new" className="btn btn-primary btn-lg">
          <PlusCircle size={20} /> Post New Donation
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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600 }}>Total Listings</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-green)' }}>{myDonations.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600 }}>Pending Requests</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning-amber)' }}>{pendingRequests.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600 }}>Active Pickups</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--info-blue)' }}>{approvedRequests.length}</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600 }}>Completed Donated</span>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d' }}>{completedRequests.length}</p>
        </div>
      </div>

      {/* Section 1: Incoming Reservation Requests */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '16px' }}>
          Incoming Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
            No pending requests awaiting your decision.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} className="card" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                padding: '20px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                      Requested {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{req.donationTitle}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--main-text)', marginTop: '4px' }}>
                    NGO: <strong>{req.ngoOrganisation || req.ngoName}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                    Quantity Claimed: <strong>{req.quantityRequested} {req.donationUnit}</strong>
                  </p>
                  {req.notes && (
                    <p style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic', marginTop: '4px' }}>
                      Note: "{req.notes}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={processingId === req.id}
                    onClick={() => handleReject(req.id)}
                  >
                    <X size={16} /> Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={processingId === req.id}
                    onClick={() => handleApprove(req.id)}
                  >
                    <Check size={16} /> Approve & Reserve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Active Pickups & Handover Coordination */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '16px' }}>
          Active Approved Pickups ({approvedRequests.length})
        </h2>

        {approvedRequests.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
            No active pickups currently scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {approvedRequests.map(req => {
              const pickup = req.pickup;
              const providerConfirmed = pickup?.handoverConfirmedByProvider;
              const receiverConfirmed = pickup?.handoverConfirmedByReceiver;

              return (
                <div key={req.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <StatusBadge status="RESERVED" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                          Pickup by: {req.ngoOrganisation || req.ngoName}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{req.donationTitle}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>
                        Quantity: <strong>{req.quantityRequested} {req.donationUnit}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem' }}>
                        <span>Provider Confirmed: {providerConfirmed ? '✅ Yes' : '⏳ Pending'}</span>
                        <span>Receiver Confirmed: {receiverConfirmed ? '✅ Yes' : '⏳ Pending'}</span>
                      </div>
                    </div>

                    <div>
                      {pickup && !providerConfirmed ? (
                        <Button
                          variant="primary"
                          loading={processingId === pickup.id}
                          onClick={() => handleConfirmHandover(pickup.id)}
                        >
                          <PackageCheck size={18} /> Confirm Handover Sent
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                          Handover Confirmed by You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: My Published Listings */}
      <section>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--main-text)', marginBottom: '16px' }}>
          My Donation Listings ({myDonations.length})
        </h2>

        {myDonations.length === 0 ? (
          <EmptyState
            title="You haven't posted any surplus food listings yet"
            description="Share your surplus meals, bakery items or produce to help local communities."
            actionLabel="Post Donation"
            onAction={() => window.location.href = '/donations/new'}
          />
        ) : (
          <div className="grid-3">
            {myDonations.map(donation => (
              <div key={donation.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-green)' }}>
                    {donation.category}
                  </span>
                  <StatusBadge status={donation.status} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  <Link to={`/donations/${donation.id}`} style={{ color: 'inherit' }}>
                    {donation.title}
                  </Link>
                </h4>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                  {donation.quantityAvailable ?? donation.quantityTotal} / {donation.quantityTotal} {donation.unit}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                  Deadline: {new Date(donation.pickupDeadline).toLocaleDateString()} at {new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <Link to={`/donations/${donation.id}`} className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                    View Listing & Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
