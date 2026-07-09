import { useState, useEffect } from 'react';
import { Search, ChevronRight, MapPin, Phone, CreditCard, X, AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { getCustomers, getCustomer } from '../api/client.js';

function CustomerCard({ t, customer, onSelect }) {
  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#0E5C52', '#C7912F', '#B5433A', '#3E7A4C', '#6B5CA5', '#2E7D8C'];
  const customerId = customer._id || customer.id || '';
  const color = colors[customerId.charCodeAt(customerId.length - 1) % colors.length] || colors[0];

  return (
    <button
      onClick={() => onSelect(customerId)}
      className="w-full text-left rounded-2xl p-3.5 flex items-center gap-4 btn-press"
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
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.text, fontFamily: 'Poppins' }} className="truncate">
          {customer.name}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Phone size={11} color={t.textMuted} strokeWidth={2} />
            <span style={{ fontSize: '0.7rem', color: t.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {customer.phone}
            </span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={11} color={t.textMuted} strokeWidth={2} />
            <span style={{ fontSize: '0.7rem', color: t.textMuted }} className="truncate">{customer.area}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <CreditCard size={11} color={t.primary} strokeWidth={2} />
          <span style={{ fontSize: '0.68rem', color: t.primary, fontWeight: 600 }}>
            {customer.activeLoans || 0} active loan{(customer.activeLoans !== 1) ? 's' : ''}
          </span>
        </div>
      </div>

      <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
    </button>
  );
}

function CustomerDetail({ t, customer, onClose, loading }) {
  if (loading || !customer) {
    return (
      <div
        className="fixed inset-0 flex items-end lg:items-center justify-center"
        style={{ zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-t-3xl lg:rounded-3xl p-6 animate-pulse"
          style={{ background: t.card, border: `1px solid ${t.border}` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 w-28 rounded" style={{ background: t.bgSubtle }} />
            <div className="h-6 w-6 rounded" style={{ background: t.bgSubtle }} />
          </div>
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className="h-16 w-16 rounded-full" style={{ background: t.bgSubtle }} />
            <div className="h-5 w-32 rounded" style={{ background: t.bgSubtle }} />
            <div className="h-3.5 w-24 rounded" style={{ background: t.bgSubtle }} />
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between py-2 border-b" style={{ borderColor: t.border }}>
                <div className="h-4 w-16 rounded" style={{ background: t.bgSubtle }} />
                <div className="h-4 w-32 rounded" style={{ background: t.bgSubtle }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const joinDate = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-LK') : 'N/A';
  const totalLoans = customer.loans?.length || customer.totalLoans || 0;
  const activeLoans = customer.loans?.filter(l => ['active', 'overdue'].includes(l.status)).length || customer.activeLoans || 0;

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
            ID: {customer._id || customer.id}
          </div>
        </div>

        {/* Detail rows */}
        {[
          { label: 'Phone',     value: customer.phone },
          { label: 'NIC',      value: customer.nic || 'N/A' },
          { label: 'Area',     value: customer.area || 'N/A' },
          { label: 'Address',  value: customer.address || 'N/A' },
          { label: 'Member Since', value: joinDate },
          { label: 'Total Loans',  value: totalLoans },
          { label: 'Active Loans', value: activeLoans },
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

export default function CustomersScreen({ t, onToggleTheme, onOpenSettings }) {
  const [search, setSearch] = useState('');
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected customer for modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCustomers(search);
        if (res && res.success) {
          setCustomersList(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(() => {
      fetchCustomers();
    }, search ? 300 : 0);

    return () => clearTimeout(delay);
  }, [search]);

  // Load customer details when selected
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomerDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const res = await getCustomer(selectedCustomerId);
        if (res && res.success) {
          setSelectedCustomerDetails(res.data);
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCustomerId]);

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Customers" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col">
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

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-6 gap-2" style={{ color: t.overdue, marginBottom: 12 }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Loading / List State */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-24 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
          </div>
        ) : (
          <>
            {/* Count */}
            <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, marginBottom: 12 }}>
              {customersList.length} customer{customersList.length !== 1 ? 's' : ''} found
            </div>

            {/* Customer list */}
            <div className="flex flex-col gap-3">
              {customersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div style={{ fontSize: '2.5rem' }}>👥</div>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.textMuted }}>No customers found</div>
                  <div style={{ fontSize: '0.8rem', color: t.textMuted }}>Try a different search term.</div>
                </div>
              ) : (
                customersList.map(c => (
                  <CustomerCard key={c._id || c.id} t={t} customer={c} onSelect={setSelectedCustomerId} />
                ))
              )}
            </div>
          </>
        )}
        </div>
      </div>

      {/* Customer detail modal */}
      {selectedCustomerId && (
        <CustomerDetail
          t={t}
          customer={selectedCustomerDetails}
          loading={detailsLoading}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}

