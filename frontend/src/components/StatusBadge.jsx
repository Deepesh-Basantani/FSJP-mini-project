import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Truck, PackageCheck, Archive } from 'lucide-react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();

  let icon = <Clock size={14} />;
  let className = 'badge-available';
  let label = s;

  switch (s) {
    case 'AVAILABLE':
      icon = <CheckCircle2 size={14} />;
      className = 'badge-available';
      label = 'Available';
      break;
    case 'RESERVED':
      icon = <Clock size={14} />;
      className = 'badge-reserved';
      label = 'Reserved';
      break;
    case 'ASSIGNED':
      icon = <Clock size={14} />;
      className = 'badge-reserved';
      label = 'Assigned';
      break;
    case 'COLLECTED':
      icon = <Truck size={14} />;
      className = 'badge-collected';
      label = 'Collected';
      break;
    case 'DELIVERED':
    case 'COMPLETED':
      icon = <PackageCheck size={14} />;
      className = 'badge-completed';
      label = 'Completed';
      break;
    case 'WITHDRAWN':
      icon = <Archive size={14} />;
      className = 'badge-withdrawn';
      label = 'Withdrawn';
      break;
    case 'EXPIRED':
      icon = <AlertTriangle size={14} />;
      className = 'badge-expired';
      label = 'Expired';
      break;
    case 'REJECTED':
      icon = <XCircle size={14} />;
      className = 'badge-rejected';
      label = 'Rejected';
      break;
    case 'CANCELLED':
      icon = <XCircle size={14} />;
      className = 'badge-cancelled';
      label = 'Cancelled';
      break;
    case 'PENDING':
      icon = <Clock size={14} />;
      className = 'badge-reserved';
      label = 'Pending Review';
      break;
    case 'VERIFIED':
      icon = <CheckCircle2 size={14} />;
      className = 'badge-available';
      label = 'Verified';
      break;
    default:
      label = s;
  }

  return (
    <span className={`badge ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
