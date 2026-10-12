import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon marker issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DonationMap({ donations = [], selectedDonation, onSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Bangalore coordinates or first donation
      const center = [12.9716, 77.5946];
      const map = L.map(mapContainerRef.current).setView(center, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = [];

    donations.forEach(donation => {
      if (donation.latitude && donation.longitude) {
        const marker = L.marker([donation.latitude, donation.longitude]).addTo(map);

        const popupContent = `
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <strong style="color: #176B4D; font-size: 14px;">${donation.title}</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #66736B;">${donation.category} • ${donation.quantityAvailable ?? donation.quantityTotal} ${donation.unit}</p>
            <p style="margin: 4px 0; font-size: 11px; color: #26332D;">📍 ${donation.address}</p>
            <a href="/donations/${donation.id}" style="display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 600; color: #176B4D;">View Details &rarr;</a>
          </div>
        `;
        marker.bindPopup(popupContent);

        if (onSelect) {
          marker.on('click', () => onSelect(donation));
        }

        markersRef.current.push(marker);
        bounds.push([donation.latitude, donation.longitude]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [donations]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        zIndex: 1
      }}
    />
  );
}
