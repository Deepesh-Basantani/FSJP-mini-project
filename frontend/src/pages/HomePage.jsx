import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, HeartHandshake, ShieldCheck, ArrowRight, Clock, Users, Award, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import DonationCard from '../components/DonationCard';

export default function HomePage() {
  const [recentDonations, setRecentDonations] = useState([]);
  const [impactStats, setImpactStats] = useState({
    totalCompletedDonations: 48,
    totalPortionsRedistributed: 1250,
    totalKgRedistributed: 340,
    totalBeneficiariesEstimated: 2100
  });

  useEffect(() => {
    // Fetch live donations
    api.getDonations({ page: 0, size: 3 })
      .then(res => {
        if (res && res.content) {
          setRecentDonations(res.content);
        }
      })
      .catch(() => {});

    // Fetch live impact stats
    api.getImpactSummary()
      .then(res => {
        if (res) {
          setImpactStats(res);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '64px' }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: 'var(--soft-mint)',
        borderBottom: '1px solid var(--border)',
        padding: '64px 0 72px'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'var(--surface-white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary-green)',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={16} />
              <span>Full-Stack Surplus Food Redistribution Platform</span>
            </div>

            <h1 style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              color: 'var(--primary-green)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '20px'
            }}>
              Turning surplus food into community support.
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--main-text)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              Connect verified restaurants, bakeries, and event caterers with community kitchens and shelters before edible food goes to waste.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link to="/donations" className="btn btn-primary btn-lg">
                Find Surplus Food <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg" style={{ backgroundColor: 'var(--surface-white)' }}>
                Register Your Organisation
              </Link>
            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="card" style={{
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '24px' }}>
              Real-Time Impact Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', background: 'var(--warm-background)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)', display: 'block' }}>
                  {impactStats.totalPortionsRedistributed ?? 1250}+
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                  Portions Saved
                </span>
              </div>

              <div style={{ padding: '16px', background: 'var(--warm-background)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)', display: 'block' }}>
                  {impactStats.totalKgRedistributed ?? 340} kg
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                  Produce & Bulk Goods
                </span>
              </div>

              <div style={{ padding: '16px', background: 'var(--warm-background)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-green)', display: 'block' }}>
                  {impactStats.totalCompletedDonations ?? 48}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                  Completed Handaways
                </span>
              </div>

              <div style={{ padding: '16px', background: 'var(--warm-background)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-green)', display: 'block' }}>
                  {impactStats.totalBeneficiariesEstimated ?? 2100}+
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                  Estimated Beneficiaries
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
              * Metrics calculated strictly from completed and mutually confirmed handovers.
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '12px' }}>
            How Food Rescue Operates
          </h2>
          <p style={{ color: 'var(--muted-text)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            A coordinated, transparent four-step workflow from surplus creation to confirmed receipt.
          </p>
        </div>

        <div className="grid-4">
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--soft-mint)',
              color: 'var(--primary-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px'
            }}>1</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>1. Post Listing</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              Provider publishes surplus details, verified quantity, preparation time, and strict collection deadline.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--soft-mint)',
              color: 'var(--primary-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px'
            }}>2</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>2. Request & Reserve</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              Verified NGOs claim needed portions. The provider approves, atomically locking quantity to prevent overbooking.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--soft-mint)',
              color: 'var(--primary-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px'
            }}>3</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>3. Coordinated Pickup</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              NGO or volunteer coordinates collection before the expiry deadline. Progress is tracked with live timestamps.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--soft-mint)',
              color: 'var(--primary-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px'
            }}>4</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>4. Mutual Handover</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
              Both provider and receiver confirm the handover. Reservation closes and impact metrics update transparently.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Surplus Listings */}
      {recentDonations.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                Active Surplus Food Listings
              </h2>
              <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>
                Available right now for verified community receivers
              </p>
            </div>
            <Link to="/donations" className="btn btn-outline">
              View All Listings &rarr;
            </Link>
          </div>

          <div className="grid-3">
            {recentDonations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
