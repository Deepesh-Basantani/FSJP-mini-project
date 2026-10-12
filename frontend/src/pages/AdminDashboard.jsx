import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Search, AlertCircle, Ban, CheckCircle2, Flag } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'reports'
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Verification rejection modal
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, reason: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [verifRes, usersRes, reportsRes] = await Promise.all([
        api.getPendingVerifications(),
        api.getAdminUsers(),
        api.getAdminReports()
      ]);
      setVerifications(Array.isArray(verifRes) ? verifRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setReports(Array.isArray(reportsRes) ? reportsRes : []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveVerification = async (userId) => {
    setProcessingId(userId);
    try {
      await api.updateVerification(userId, { approved: true, reason: 'Approved by administrator' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectVerification = async () => {
    if (!rejectModal.userId) return;
    setProcessingId(rejectModal.userId);
    try {
      await api.updateVerification(rejectModal.userId, { approved: false, reason: rejectModal.reason || 'Insufficient verification details' });
      setRejectModal({ open: false, userId: null, reason: '' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    setProcessingId(userId);
    try {
      await api.updateUserStatus(userId, !currentActive);
      await loadData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveReport = async (reportId, resolve) => {
    setProcessingId(reportId);
    try {
      await api.resolveReport(reportId, resolve);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 0' }}><LoadingState message="Loading administration dashboard..." /></div>;

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: 'var(--soft-mint)',
          color: 'var(--primary-green)',
          padding: '10px',
          borderRadius: 'var(--radius-md)'
        }}>
          <Shield size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
            System Administration & Moderation
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
            Verify organisations, moderate user reports, and manage system accounts.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: 'var(--error-red)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('verifications')}
          style={{
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'verifications' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'verifications' ? 'var(--primary-green)' : 'var(--muted-text)'
          }}
        >
          Verification Queue ({verifications.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--primary-green)' : 'var(--muted-text)'
          }}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'reports' ? '3px solid var(--primary-green)' : '3px solid transparent',
            color: activeTab === 'reports' ? 'var(--primary-green)' : 'var(--muted-text)'
          }}
        >
          Moderation Reports ({reports.length})
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div>
          {verifications.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--muted-text)' }}>
              No organisations currently awaiting verification.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {verifications.map(u => (
                <div key={u.id} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status="PENDING" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>Role: {u.role}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{u.organisationName || u.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>
                      Contact: {u.name} ({u.email}) • Phone: {u.phone || 'N/A'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={processingId === u.id}
                      onClick={() => setRejectModal({ open: true, userId: u.id, reason: '' })}
                    >
                      <X size={16} /> Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={processingId === u.id}
                      onClick={() => handleApproveVerification(u.id)}
                    >
                      <Check size={16} /> Approve Organisation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {users.map(u => (
              <div key={u.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{u.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>({u.role})</span>
                    <StatusBadge status={u.verificationStatus} />
                    {!u.isActive && <span style={{ color: 'var(--error-red)', fontSize: '0.8rem', fontWeight: 700 }}>[SUSPENDED]</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                    {u.email} • {u.organisationName || 'Individual'}
                  </p>
                </div>

                <div>
                  {u.role !== 'ADMINISTRATOR' && (
                    <Button
                      variant={u.isActive ? 'danger' : 'outline'}
                      size="sm"
                      loading={processingId === u.id}
                      onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                    >
                      {u.isActive ? <><Ban size={14} /> Suspend</> : <><CheckCircle2 size={14} /> Reactivate</>}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Moderation Reports */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--muted-text)' }}>
              No user reports or complaints logged.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reports.map(r => (
                <div key={r.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status={r.status} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                        Target: {r.targetType} #{r.targetId} • Filed: {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--main-text)' }}>
                      Reason: "{r.reason}"
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                      Reported by: {r.reporter?.name} ({r.reporter?.email})
                    </p>
                  </div>

                  {r.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        loading={processingId === r.id}
                        onClick={() => handleResolveReport(r.id, false)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={processingId === r.id}
                        onClick={() => handleResolveReport(r.id, true)}
                      >
                        Resolve & Action
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--error-red)', marginBottom: '8px' }}>
              Decline Organisation Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
              State the reason for declining so the organisation can correct its details.
            </p>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Incomplete registration documentation or invalid contact number..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(m => ({ ...m, reason: e.target.value }))}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <Button variant="outline" onClick={() => setRejectModal({ open: false, userId: null, reason: '' })}>
                Cancel
              </Button>
              <Button variant="danger" loading={processingId === rejectModal.userId} onClick={handleRejectVerification}>
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
