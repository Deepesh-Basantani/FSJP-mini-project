import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const CATEGORIES = [
  'Cooked Meals',
  'Bakery',
  'Fresh Produce',
  'Packaged Goods',
  'Dairy',
  'Beverages'
];

const UNITS = [
  'portions',
  'kg',
  'packets',
  'boxes',
  'meals',
  'litres'
];

export default function PostDonationPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantityTotal, setQuantityTotal] = useState('');
  const [unit, setUnit] = useState('portions');
  const [preparedAt, setPreparedAt] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [address, setAddress] = useState('');
  const [packagingNotes, setPackagingNotes] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file exceeds the 5MB size limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pickupDeadline) {
      setError('Pickup deadline is mandatory.');
      return;
    }

    const deadlineDate = new Date(pickupDeadline);
    if (deadlineDate <= new Date()) {
      setError('Pickup deadline must be set in the future.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        category,
        quantityTotal: parseFloat(quantityTotal),
        unit,
        preparedAt: preparedAt ? new Date(preparedAt).toISOString() : new Date().toISOString(),
        pickupDeadline: new Date(pickupDeadline).toISOString(),
        address,
        latitude: 12.9716, // Default city center coordinates
        longitude: 77.5946,
        packagingNotes,
        storageInstructions
      };

      const donation = await api.createDonation(payload);

      // Upload image if selected
      if (imageFile && donation?.id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await api.uploadImage(donation.id, formData).catch(err => {
          console.warn('Image upload error:', err);
        });
      }

      navigate('/provider/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to post donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px var(--space-16) 64px', maxWidth: '780px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ padding: '36px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-green)', marginBottom: '8px' }}>
          Post Surplus Food Donation
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem', marginBottom: '28px' }}>
          Provide clear descriptions, preparation timestamps, and collection instructions to ensure safe and prompt pickup.
        </p>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--error-red)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Listing Title"
            id="food-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Fresh Cooked Lunch Buffet (Rice, Dal, Mixed Veg Curry)"
          />

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="food-category">Food Category *</label>
              <select
                id="food-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                required
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <Input
                label="Total Quantity *"
                id="food-qty"
                type="number"
                step="0.1"
                min="0.1"
                value={quantityTotal}
                onChange={(e) => setQuantityTotal(e.target.value)}
                required
                placeholder="e.g. 30"
              />

              <div className="form-group">
                <label className="form-label" htmlFor="food-unit">Unit *</label>
                <select
                  id="food-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-select"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <Input
              label="Preparation Time *"
              id="food-prepared-at"
              type="datetime-local"
              value={preparedAt}
              onChange={(e) => setPreparedAt(e.target.value)}
              required
              helpText="When was this food cooked or packed?"
            />

            <Input
              label="Collection Deadline *"
              id="food-deadline"
              type="datetime-local"
              value={pickupDeadline}
              onChange={(e) => setPickupDeadline(e.target.value)}
              required
              helpText="Must be strictly collected before this time"
            />
          </div>

          <Input
            label="Pickup Address *"
            id="food-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="e.g. 42 Commercial Street, Central District, Bengaluru"
          />

          <div className="form-group">
            <label className="form-label" htmlFor="food-desc">Food Details & Allergens</label>
            <textarea
              id="food-desc"
              rows="3"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List dishes included, allergen notices (e.g. contains nuts, dairy-free), and temperature conditions..."
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="food-packaging">Packaging Information</label>
              <input
                id="food-packaging"
                type="text"
                className="form-input"
                value={packagingNotes}
                onChange={(e) => setPackagingNotes(e.target.value)}
                placeholder="e.g. In stainless steel trays; bring crates"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="food-storage">Storage Instructions</label>
              <input
                id="food-storage"
                type="text"
                className="form-input"
                value={storageInstructions}
                onChange={(e) => setStorageInstructions(e.target.value)}
                placeholder="e.g. Keep warm above 63°C or consume in 3h"
              />
            </div>
          </div>

          {/* Photo File Input */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Attach Food Photograph (Optional, max 5MB)</label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#fafcfb'
            }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                <Upload size={28} style={{ color: 'var(--primary-green)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--main-text)' }}>
                  Click to select photo (JPEG, PNG, WebP)
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                  {imageFile ? imageFile.name : 'No file chosen'}
                </p>
              </label>

              {imagePreview && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: '140px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            <PlusCircle size={20} /> Publish Donation Listing
          </Button>
        </form>
      </div>
    </div>
  );
}
