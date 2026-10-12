import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no active items available for this criteria right now.',
  actionLabel,
  onAction,
  icon: Icon = PackageOpen
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      background: 'var(--surface-white)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius-md)',
      margin: '16px 0'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--soft-mint)',
        color: 'var(--primary-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--main-text)', marginBottom: '8px', fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--muted-text)', maxWidth: '420px', fontSize: '0.9rem', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
