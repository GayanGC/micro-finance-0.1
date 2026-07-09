import { useState, useEffect } from 'react';
import { Shield, Clock, Briefcase, Plus, Search, AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';
import { getLoans } from '../api/client.js';

const FILTER_OPTIONS = [
  { key: 'All',       label: 'All Loans',  Icon: null },
  { key: 'Insurance', label: 'Insurance',  Icon: Shield },
  { key: 'Daily',     label: 'Daily',      Icon: Clock },
  { key: 'Wage',      label: 'Wage',       Icon: Briefcase },
];

function LoanCard({ t, loan }) {
  const isOverdue = loan.status?.toLowerCase() === 'overdue';
  const customerName = loan.customer?.name || loan.customerName || 'Unknown';
  const area = loan.customer?.area || loan.area || '';
  const loanId = loan._id || loan.id || '';
  const formattedDueDate = loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : 'N/A';
  const displayStatus = loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Pending';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: t.card,
        border: `1px solid ${isOverdue ? t.overdue + '44' : t.border}`,
        boxShadow: t.shadow,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: t.text, fontFamily: 'Poppins' }}>
            {customerName}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>
            {area} · ID: {loanId}
          </div>
        </div>
        <Stamp t={t} status={displayStatus} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: t.border }} />

      {/* Details row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Type
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: t.text }}>
            {loan.type}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-center">
          <span style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Due Date
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isOverdue ? t.overdue : t.text }}>
            {formattedDueDate}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Balance
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              fontSize: '0.88rem',
              color: loan.balance === 0 ? t.paid : t.text,
            }}
          >
            {loan.balance === 0 ? 'Cleared' : formatRs(loan.balance)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoansScreen({ t, onNavigate, onToggleTheme, onOpenSettings }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loansList, setLoansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLoans({ type: filter });
      if (res && res.success) {
        setLoansList(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const filtered = loansList.filter(l => {
    const customerName = l.customer?.name || l.customerName || '';
    const loanId = l._id || l.id || '';
    return !search ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      loanId.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar
        t={t}
        title="Loans"
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
      />

      <div className="flex-1 px-4 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        {/* Search */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 mb-4"
          style={{ background: t.card, border: `1.5px solid ${t.border}`, height: 48 }}
        >
          <Search size={16} color={t.textMuted} strokeWidth={2} />
          <input
            placeholder="Search loans or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: '0.88rem',
              color: t.text,
              fontFamily: 'Inter',
            }}
          />
        </div>

        {/* Filter tiles */}
        <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar pb-1">
          {FILTER_OPTIONS.map(({ key, label, Icon }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-2 rounded-2xl px-4 btn-press flex-shrink-0"
                style={{
                  height: 40,
                  background: active ? t.primary : t.card,
                  border: `1.5px solid ${active ? t.primary : t.border}`,
                  color: active ? t.onPrimary : t.textMuted,
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {Icon && <Icon size={14} strokeWidth={2} />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-6 gap-2" style={{ color: t.overdue }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-32 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
          </div>
        ) : (
          <>
            {/* Count */}
            <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, marginBottom: 12 }}>
              {filtered.length} loan{filtered.length !== 1 ? 's' : ''} found
            </div>

            {/* Loan list */}
            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div style={{ fontSize: '2.5rem' }}>📋</div>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.textMuted }}>No loans found</div>
                  <div style={{ fontSize: '0.8rem', color: t.textMuted }}>Try a different filter or search term.</div>
                </div>
              ) : (
                filtered.map(loan => <LoanCard key={loan._id} t={t} loan={loan} />)
              )}
            </div>
          </>
        )}
      </div>

      {/* FAB — New Loan */}
      <button
        onClick={() => onNavigate('newloan')}
        className="lg:hidden fixed btn-press flex items-center gap-2 rounded-2xl"
        style={{
          bottom: 80,
          right: 20,
          background: t.primary,
          color: t.onPrimary,
          border: 'none',
          padding: '12px 20px',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: `0 4px 20px ${t.primary}55`,
          zIndex: 90,
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        New Loan
      </button>

      {/* Desktop: New Loan button in content */}
      <div className="hidden lg:block" style={{ position: 'fixed', bottom: 32, right: 32 }}>
        <button
          onClick={() => onNavigate('newloan')}
          className="btn-press flex items-center gap-2 rounded-2xl"
          style={{
            background: t.primary,
            color: t.onPrimary,
            border: 'none',
            padding: '13px 24px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${t.primary}55`,
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          New Loan
        </button>
      </div>
    </div>
  );
}

