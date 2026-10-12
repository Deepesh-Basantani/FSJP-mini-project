import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, MapPin, Calendar, Package, AlertTriangle, ShieldCheck, Flag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingState from '../components/LoadingState';

export default function DonationDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reservation Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQty, setRequestQty] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getDonation(id)
      .then(res => {
        setDonation(res);
        if (res.quantityAvailable) {
          setRequestQty(res.quantityAvailable.toString());
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load donation details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'NGO') {
      setRequestError('Only registered NGO / Community Receiver accounts can request food.');
      return;
    }

    const qty = parseFloat(requestQty);
    if (!qty || qty <= 0) {
      setRequestError('Please specify a positive quantity.');
      return;
    }

    if (qty > donation.quantityAvailable) {
      setRequestError(`Requested quantity exceeds available ${donation.quantityAvailable} ${donation.unit}.`);
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.requestReservation(id, {
        quantityRequested: qty,
        notes: requestNotes
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        navigate('/ngo/dashboard');
      }, 1500);
    } catch (err) {
      setRequestError(err.message || 'Request failed.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await api.createReport({
        targetType: 'DONATION',
        targetId: parseInt(id),
        reason: reportReason
      });
      setReportSuccess(true);
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (err) {
      alert(err.message || 'Failed to file report');
    } finally {
      setReporting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this donation listing? It will no longer accept requests.')) return;
    try {
      await api.withdrawDonation(id);
      alert('Donation listing has been withdrawn.');
      navigate('/provider/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to withdraw donation.');
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><LoadingState /></div>;
  if (error || !donation) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error-red)', marginBottom: '16px' }}>{error || 'Donation not found'}</h2>
        <Link to="/donations" className="btn btn-outline">&larr; Back to Listings</Link>
      </div>
    );
  }

  const isOwner = user && donation.providerId === user.id;

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px', maxWidth: '960px' }}>
      <Link to="/donations" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Available Food
      </Link>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Header photo banner */}
        <div style={{
          height: '280px',
          backgroundColor: '#eaf1ec',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {donation.imageUrl ? (
            <img
              src={donation.imageUrl.startsWith('http') ? donation.imageUrl : `http://localhost:8080${donation.imageUrl}`}
              alt={donation.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--primary-green)' }}>
              <Package size={56} style={{ margin: '0 auto 8px', opacity: 0.7 }} />
              <p style={{ fontWeight: 600 }}>{donation.category}</p>
            </div>
          )}

          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <StatusBadge status={donation.status} />
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'var(--soft-mint)',
                color: 'var(--primary-green)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                {donation.category}
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--main-text)' }}>
                {donation.title}
              </h1>
              {donation.providerOrganisation && (
                <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem', marginTop: '4px' }}>
                  Offered by: <strong>{donation.providerOrganisation}</strong>
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-green)', lineHeight: 1 }}>
                {donation.quantityAvailable ?? donation.quantityTotal}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--muted-text)', display: 'block' }}>
                {donation.unit} available
              </span>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--main-text)', marginBottom: '28px' }}>
            {donation.description || 'No detailed description provided.'}
          </p>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--warm-background)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Collection Deadline
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--warning-amber)' }}>
                {new Date(donation.pickupDeadline).toLocaleString()}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Prepared At
              </span>
              <strong style={{ fontSize: '0.95rem' }}>
                {new Date(donation.preparedAt).toLocaleString()}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> Pickup Address
              </span>
              <strong style={{ fontSize: '0.95rem' }}>
                {donation.address}
              </strong>
            </div>
          </div>

          {/* Packaging and Storage Notes */}
          {(donation.packagingNotes || donation.storageInstructions) && (
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--primary-green)' }}>
                Handling & Safety Instructions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {donation.packagingNotes && (
                  <div style={{ padding: '12px', background: '#f8faf9', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Packaging Condition:</p>
                    <p style={{ fontSize: '0.9rem' }}>{donation.packagingNotes}</p>
                  </div>
                )}
                {donation.storageInstructions && (
                  <div style={{ padding: '12px', background: '#f8faf9', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Storage Requirements:</p>
                    <p style={{ fontSize: '0.9rem' }}>{donation.storageInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--muted-text)'
              }}
            >
              <Flag size={14} /> Report this listing
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              {isOwner ? (
                <>
                  <Link to="/provider/dashboard" className="btn btn-outline">
                    View Incoming Requests
                  </Link>
                  {donation.status === 'AVAILABLE' && (
                    <Button variant="danger" onClick={handleWithdraw}>
                      Withdraw Listing
                    </Button>
                  )}
                </>
              ) : (
                donation.status === 'AVAILABLE' && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowRequestModal(true)}
                  >
                    Request Food
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '8px' }}>
              Request Food Donation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '20px' }}>
              Available: <strong>{donation.quantityAvailable} {donation.unit}</strong>
            </p>

            {requestSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--primary-green)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
                <h4>Request Submitted Successfully!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                  The provider has been notified to review and approve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                {requestError && (
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#fef2f2',
                    color: 'var(--error-red)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}>
                    {requestError}
                  </div>
                )}

                <Input
                  label={`Quantity to Request (${donation.unit})`}
                  id="req-qty"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={donation.quantityAvailable}
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  required
                />

                <div className="form-group">
                  <label className="form-label" htmlFor="req-notes">
                    Collection / Intended Use Notes (Optional)
                  </label>
                  <textarea
                    id="req-notes"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="e.g. For dinner service at community shelter. We will collect by 5 PM with thermal insulated transport."
                    rows="3"
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submittingRequest}>
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--error-red)', marginBottom: '8px' }}>
              Report Donation Listing
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
              Flag unsafe, inaccurate or inappropriate listings for administrative moderation.
            </p>

            {reportSuccess ? (
              <p style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Thank you. Report filed for admin review.</p>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label className="form-label">Reason for Report</label>
                  <textarea
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows="3"
                    className="form-textarea"
                    placeholder="Explain why this listing is unsafe or misbehaving..."
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
                  <Button type="submit" variant="danger" loading={reporting}>Submit Report</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
