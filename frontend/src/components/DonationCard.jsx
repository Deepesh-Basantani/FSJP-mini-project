import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Utensils, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DonationCard({ donation, onAction, actionLabel = 'View details' }) {
  const [imgError, setImgError] = useState(false);

  const formatDeadline = (dateString) => {
    if (!dateString) return 'No deadline specified';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((date - now) / (1000 * 60 * 60));

    if (diffHours < 0) return 'Expired';
    if (diffHours === 0) return 'Expires in less than 1 hour';
    if (diffHours === 1) return 'Expires in 1 hour';
    if (diffHours < 24) return `Expires in ${diffHours} hours`;
    return `Deadline: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isUrgent = () => {
    if (!donation.pickupDeadline) return false;
    const diffHours = (new Date(donation.pickupDeadline) - new Date()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 3;
  };

  return (
    <article className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '0'
    }}>
      {/* Food Photo or Semantic Fallback */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        backgroundColor: '#eaf1ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {donation.imageUrl && !imgError ? (
          <img
            src={donation.imageUrl.startsWith('http') ? donation.imageUrl : `http://localhost:8080${donation.imageUrl}`}
            alt={donation.title}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary-green)', opacity: 0.8 }}>
            <Utensils size={40} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '6px' }}>{donation.category || 'Surplus Food'}</span>
          </div>
        )}

        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <StatusBadge status={donation.status} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(23, 107, 77, 0.9)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {donation.category}
        </div>
      </div>

      {/* Card Details */}
      <div style={{ padding: 'var(--space-16)', display: 'flex', flexDirection: 'column', flex: 1, gap: 'var(--space-8)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--main-text)', lineHeight: 1.3 }}>
          <Link to={`/donations/${donation.id}`} style={{ color: 'inherit' }}>
            {donation.title}
          </Link>
        </h3>

        {donation.providerOrganisation && (
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 500 }}>
            By: {donation.providerOrganisation}
          </p>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          padding: '8px 0',
          borderBottom: '1px solid var(--border)',
          margin: '4px 0'
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-green)' }}>
            {donation.quantityAvailable ?? donation.quantityTotal}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--muted-text)', fontWeight: 500 }}>
            {donation.unit} available
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isUrgent() ? 'var(--warning-amber)' : 'inherit',
            fontWeight: isUrgent() ? 600 : 400
          }}>
            <Clock size={15} />
            <span>{formatDeadline(donation.pickupDeadline)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {donation.address}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-12)' }}>
          <Link
            to={`/donations/${donation.id}`}
            className="btn btn-secondary"
            style={{ width: '100%', textAlign: 'center' }}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
