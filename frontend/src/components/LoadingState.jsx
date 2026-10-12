import React from 'react';

export default function LoadingState({ message = 'Loading details...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      gap: '16px',
      color: 'var(--muted-text)'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary-green)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ fontSize: '0.95rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
