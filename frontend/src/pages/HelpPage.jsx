import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function HelpPage() {
  const [complaintType, setComplaintType] = useState('DONATION');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createReport({
        targetType: complaintType,
        targetId: parseInt(targetId) || 1,
        reason
      });
      setSubmitted(true);
      setReason('');
      setTargetId('');
    } catch (err) {
      alert(err.message || 'Failed to submit report. Please sign in if needed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px', maxWidth: '880px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-green)' }}>
          Help, Guidance & Food Safety Standards
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '1.05rem' }}>
          Protocols for safe surplus food handling, platform rules, and problem resolution.
        </p>
      </div>

      {/* Food Safety & Hygiene Guidelines - Section 13 */}
      <section className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-green)', marginBottom: '16px' }}>
          <ShieldCheck size={26} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Mandatory Food Safety & Handling Guidelines
          </h2>
        </div>

        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
          Food donation involves real people and perishable items. In accordance with Section 13 of the project blueprint, the platform serves as a coordination tool—safe transport and handling remain the shared responsibility of participants.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--warm-background)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              1. Temperature Management
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              Cooked hot foods must be maintained above 63°C or cooled rapidly and stored below 4°C. Perishable items must not remain in the ambient danger zone (5°C to 60°C).
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--warm-background)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              2. Packaging Hygiene
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              All surplus food must be sealed in clean, food-grade packaging or stainless containers. Clearly distinguish vegetarian vs. non-vegetarian and label common allergens.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--warm-background)', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '6px' }}>
              3. Time Windows & Expiry
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              Prepared food must be collected and consumed within 4 hours of pickup. Listings past their collection deadline are automatically expired by the system scheduler.
            </p>
          </div>
        </div>

        <div style={{ padding: '12px 16px', backgroundColor: 'var(--soft-mint)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--main-text)' }}>
          <strong>Compliance Note:</strong> For implementations in India, all activities adhere to <em>Food Safety and Standards Authority of India (FSSAI) Surplus Food Regulations</em>.
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-green)', marginBottom: '20px' }}>
          <HelpCircle size={26} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Frequently Asked Questions (FAQ)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--main-text)' }}>
              How does the atomic quantity lock prevent overbooking?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginTop: '4px', lineHeight: 1.5 }}>
              When a provider approves a reservation request, the database executes a transactional write lock. The requested quantity is deducted immediately from the available pool so concurrent requests cannot claim more than is physically present.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--main-text)' }}>
              Why do both parties need to confirm the handover?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginTop: '4px', lineHeight: 1.5 }}>
              To ensure data integrity and prevent fraudulent impact reporting, a donation is only completed when the provider confirms dispatch and the NGO confirms physical receipt.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--main-text)' }}>
              What happens if surplus food passes the deadline?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginTop: '4px', lineHeight: 1.5 }}>
              The backend ExpiryScheduler job automatically closes listings that reach their collection deadline. They are hidden from new searches but retained in audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Report a Problem Form */}
      <section className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warning-amber)', marginBottom: '16px' }}>
          <AlertTriangle size={24} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--main-text)' }}>
            Report an Issue or Complaint
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', marginBottom: '20px' }}>
          Flag misleading listings, hygiene violations, or account issues. Administrators review every filed report.
        </p>

        {submitted ? (
          <div style={{ padding: '16px', backgroundColor: '#ecfdf5', color: '#15803d', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} />
            <span>Thank you. Your report has been submitted to the moderation queue.</span>
          </div>
        ) : (
          <form onSubmit={handleReport}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Report Target</label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="form-select"
                >
                  <option value="DONATION">Specific Food Listing</option>
                  <option value="USER">User Account / Organisation</option>
                </select>
              </div>

              <Input
                label="Target ID (Listing # or User #)"
                id="target-id"
                type="number"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                placeholder="e.g. 1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Explanation of Issue</label>
              <textarea
                required
                rows="3"
                className="form-textarea"
                placeholder="Describe what went wrong, hygiene concerns, or misleading descriptions..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="submit" variant="primary" loading={submitting}>
                <Send size={16} /> Submit to Moderation
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
