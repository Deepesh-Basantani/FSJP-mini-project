import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--surface-white)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      padding: '48px 0 24px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-green)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px' }}>
              <HeartHandshake size={22} />
              <span>Food Rescue</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', lineHeight: 1.6 }}>
              A full-stack surplus food redistribution platform connecting restaurants, bakeries, and canteens with verified NGOs, community kitchens, and shelters.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--main-text)' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <li><Link to="/donations">Find Surplus Food</Link></li>
              <li><Link to="/register">Join as Food Provider / NGO</Link></li>
              <li><Link to="/impact">Impact Metrics & Transparency</Link></li>
              <li><Link to="/help">How It Works & FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--main-text)' }}>
              Food Safety & Trust Notice
            </h4>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary-green)', flexShrink: 0, marginTop: '2px' }} />
              <p>
                Food Rescue is a coordination tool. Donors and receivers are required to follow applicable handling, safe packaging, temperature control, and local food hygiene regulations.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--muted-text)'
        }}>
          <p>© {new Date().getFullYear()} Food Rescue Project. Built for Full-Stack Java/React Project Blueprint.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/help">Privacy & Verification Guidelines</Link>
            <Link to="/help">Terms of Coordination</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
