import { useState } from 'react';
import { Search, ChevronRight, MapPin, Phone, CreditCard, X } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

function CustomerCard({ t, customer, onSelect }) {
  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#0E5C52', '#C7912F', '#B5433A', '#3E7A4C', '#6B5CA5', '#2E7D8C'];
  const color = colors[customer.id.charCodeAt(1) % colors.length];

  return (
    <button
      onClick={() => onSelect(customer)}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-4 btn-press"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        cursor: 'pointer',
        boxShadow: t.shadow,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowMd; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 46,
          height: 46,
          background: `${color}18`,
          border: `2px solid ${color}33`,
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.9rem',
          color,
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.text, fontFamily: 'Poppins' }}>
          {customer.name}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Phone size={11} color={t.textMuted} strokeWidth={2} />
            <span style={{ fontSize: '0.7rem', color: t.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {customer.phone}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={11} color={t.textMuted} strokeWidth={2} />
            <span style={{ fontSize: '0.7rem', color: t.textMuted }}>{customer.area}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <CreditCard size={11} color={t.primary} strokeWidth={2} />
          <span style={{ fontSize: '0.68rem', color: t.primary, fontWeight: 600 }}>
            {customer.activeLoans} active loan{customer.activeLoans !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
    </button>
  );
}

function CustomerDetail({ t, customer, onClose }) {
  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div
      className="fixed inset-0 flex items-end lg:items-center justify-center"
      style={{ zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl lg:rounded-3xl p-6"
        style={{ background: t.card, border: `1px solid ${t.border}`, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>
            Customer Profile
          </h2>
          <button
            onClick={onClose}
            style={{ background: t.bgSubtle, border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color={t.textMuted} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex items-center justify-center rounded-full mb-3"
            style={{
              width: 68,
              height: 68,
              background: t.primarySoft,
              fontFamily: 'Poppins',
              fontWeight: 800,
              fontSize: '1.3rem',
              color: t.primary,
            }}
          >
            {initials}
          </div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: t.text }}>
            {customer.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>
            ID: {customer.id}
          </div>
        </div>

        {/* Detail rows */}
        {[
          { label: 'Phone',     value: customer.phone },
          { label: 'NIC',      value: customer.nic },
          { label: 'Area',     value: customer.area },
          { label: 'Address',  value: customer.address },
          { label: 'Member Since', value: customer.joinDate },
          { label: 'Total Loans',  value: customer.totalLoans },
          { label: 'Active Loans', value: customer.activeLoans },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between py-3"
            style={{ borderBottom: `1px solid ${t.border}` }}
          >
            <span style={{ fontSize: '0.78rem', color: t.textMuted, fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: '0.82rem', color: t.text, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomersScreen({ t, customers, onToggleTheme, onOpenSettings }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.area.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Customers" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 px-4 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        {/* Search bar */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 mb-5"
          style={{ background: t.card, border: `1.5px solid ${t.border}`, height: 52 }}
        >
          <Search size={16} color={t.textMuted} strokeWidth={2} />
          <input
            placeholder="Search name, phone, or area…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.9rem', color: t.text, fontFamily: 'Inter' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} color={t.textMuted} />
            </button>
          )}
        </div>

        {/* Count */}
        <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, marginBottom: 12 }}>
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''} found
        </div>

        {/* Customer list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div style={{ fontSize: '2.5rem' }}>👥</div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.textMuted }}>No customers found</div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted }}>Try a different search term.</div>
            </div>
          ) : (
            filtered.map(c => (
              <CustomerCard key={c.id} t={t} customer={c} onSelect={setSelected} />
            ))
          )}
        </div>
      </div>

      {/* Customer detail modal */}
      {selected && (
        <CustomerDetail t={t} customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
