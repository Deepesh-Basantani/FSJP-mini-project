import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, Grid, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import DonationCard from '../components/DonationCard';
import DonationMap from '../components/DonationMap';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const CATEGORIES = [
  'All Categories',
  'Cooked Meals',
  'Bakery',
  'Fresh Produce',
  'Packaged Goods',
  'Dairy',
  'Beverages'
];

export default function AvailableFoodPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('pickupDeadline');
  const [sortDir, setSortDir] = useState('ASC');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = () => {
    setLoading(true);
    const params = {
      page,
      size: 9,
      sortBy,
      sortDir
    };

    if (selectedCategory !== 'All Categories') {
      params.category = selectedCategory;
    }
    if (search.trim()) {
      params.keyword = search.trim();
    }

    api.getDonations(params)
      .then(res => {
        if (res && res.content) {
          setDonations(res.content);
          setTotalPages(res.totalPages || 1);
        } else if (Array.isArray(res)) {
          setDonations(res);
        }
      })
      .catch(err => {
        console.error('Failed to fetch donations:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, sortBy, sortDir, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchListings();
  };

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px' }}>
      {/* Header and Controls */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-green)', marginBottom: '8px' }}>
          Available Surplus Food
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '1rem' }}>
          Discover and request quality surplus food before its collection deadline.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
          gap: '12px',
          alignItems: 'end'
        }}>
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="search-input">Search Food or Location</label>
            <div style={{ position: 'relative' }}>
              <input
                id="search-input"
                type="text"
                placeholder="e.g. Biryani, Bread, Bengaluru..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--muted-text)' }} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="category-select">Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
              className="form-select"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sort-select">Sort By</label>
            <select
              id="sort-select"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="form-select"
            >
              <option value="pickupDeadline-ASC">Deadline (Urgent First)</option>
              <option value="createdAt-DESC">Newest Added</option>
              <option value="quantityAvailable-DESC">Highest Quantity</option>
            </select>
          </div>

          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} /> Grid
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline'}
              onClick={() => setViewMode('map')}
              title="Map View"
            >
              <Map size={18} /> Map
            </Button>
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Fetching active surplus listings..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No surplus food listings match your criteria"
          description="Try broadening your category filter or search keywords. New donations are posted continuously."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All Categories');
            setPage(0);
          }}
        />
      ) : viewMode === 'map' ? (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>
              Showing {donations.length} pickup locations on OpenStreetMap
            </span>
          </div>
          <DonationMap donations={donations} />
        </div>
      ) : (
        <>
          <div className="grid-3">
            {donations.map(donation => (
              <DonationCard key={donation.id} donation={donation} actionLabel="View & Request" />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '40px'
            }}>
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
