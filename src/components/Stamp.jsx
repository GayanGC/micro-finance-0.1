import { statusColor } from '../theme.js';

// Stamp — ink-stamp style status badge
// status: 'Active' | 'Overdue' | 'Paid' | 'Pending'
export default function Stamp({ t, status, className = '' }) {
  const color = statusColor(t, status);
  return (
    <span
      className={`stamp-badge ${className}`}
      style={{
        color,
        borderColor: color,
        boxShadow: `0 0 0 3px ${color}22`,
      }}
    >
      {status}
    </span>
  );
}
