import { useState, useEffect } from 'react';
import { Shield, Clock, Briefcase, Plus, Search, AlertCircle, X, Download, User, Info, FileText, Calendar } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';
import { getLoans, getLoan } from '../api/client.js';

const FILTER_OPTIONS = [
  { key: 'All',       label: 'All Loans',  Icon: null },
  { key: 'Insurance', label: 'Insurance',  Icon: Shield },
  { key: 'Daily',     label: 'Daily',      Icon: Clock },
  { key: 'Wage',      label: 'Wage',       Icon: Briefcase },
];

function LoanCard({ t, loan, onClick }) {
  const isOverdue = loan.status?.toLowerCase() === 'overdue';
  const customerName = loan.customer?.name || loan.customerName || 'Unknown';
  const area = loan.customer?.area || loan.area || '';
  const formattedDueDate = loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : 'N/A';
  const displayStatus = loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Pending';
  const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between gap-4 rounded-2xl p-4 btn-press cursor-pointer"
      style={{
        background: t.card,
        border: `1px solid ${isOverdue ? t.overdue + '44' : t.border}`,
        boxShadow: t.shadow,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = t.shadowMd;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = t.shadow;
      }}
    >
      {/* Left group */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 44,
            height: 44,
            background: `linear-gradient(135deg, ${t.primary}22, ${t.primary}11)`,
            border: `1.5px solid ${t.primary}33`,
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: t.primary,
          }}
        >
          {initials}
        </div>
        {/* Info */}
        <div className="min-w-0">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.text, fontFamily: 'Poppins' }} className="truncate">
            {customerName}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 3 }} className="truncate">
            {loan.type} · {area} · Due: {formattedDueDate}
          </div>
        </div>
      </div>

      {/* Right group */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            fontSize: '0.9rem',
            color: loan.balance === 0 ? t.paid : t.text,
          }}
        >
          {loan.balance === 0 ? 'Cleared' : formatRs(loan.balance)}
        </span>
        <Stamp t={t} status={displayStatus} />
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

  // Detailed Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

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

  const handleViewLoan = async (loanId) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError('');
    try {
      const res = await getLoan(loanId);
      if (res && res.success) {
        setSelectedLoan(res.data);
      } else {
        throw new Error('Could not load loan details');
      }
    } catch (err) {
      setModalError(err.message || 'Error loading loan details');
    } finally {
      setModalLoading(false);
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

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col">
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
                filtered.map(loan => (
                  <LoanCard 
                    key={loan._id} 
                    t={t} 
                    loan={loan} 
                    onClick={() => handleViewLoan(loan._id)} 
                  />
                ))
              )}
            </div>
          </>
        )}
        </div>
      </div>

      {/* Detailed Loan Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl p-6 flex flex-col gap-6 modal-card"
            style={{ 
              background: t.card, 
              border: `1px solid ${t.border}`, 
              boxShadow: t.shadowMd,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4" style={{ borderBottom: `1px solid ${t.border}` }}>
              <div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.2rem', color: t.text }}>
                  Loan Details & Report
                </h3>
                <span className="text-xs" style={{ color: t.textMuted }}>
                  Loan ID: {selectedLoan?._id || 'Loading...'}
                </span>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="btn-press p-2 rounded-full"
                style={{ background: t.bgSubtle, cursor: 'pointer', border: 'none' }}
              >
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: t.primary }} />
                <span style={{ fontSize: '0.85rem', color: t.textMuted }}>Fetching full history & reports...</span>
              </div>
            ) : modalError ? (
              <div className="flex items-center justify-center p-6 gap-2" style={{ color: t.overdue }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{modalError}</span>
              </div>
            ) : selectedLoan ? (
              <div className="flex flex-col gap-6">
                {/* Visual Repayment Progress */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1" style={{ color: t.textMuted }}>
                    <span>REPAYMENT PROGRESS</span>
                    <span style={{ color: t.primary }}>
                      {Math.round(((selectedLoan.amount - selectedLoan.balance) / selectedLoan.amount) * 100)}% Repaid
                    </span>
                  </div>
                  <div className="w-full rounded-full h-3" style={{ background: t.bgSubtle }}>
                    <div 
                      className="rounded-full h-3"
                      style={{ 
                        width: `${Math.min(100, Math.round(((selectedLoan.amount - selectedLoan.balance) / selectedLoan.amount) * 100))}%`,
                        background: `linear-gradient(90deg, ${t.primary}, ${t.active})`
                      }}
                    />
                  </div>
                </div>

                {/* Primary Financial Overview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
                    <span className="text-[10px] font-bold block" style={{ color: t.textMuted, letterSpacing: '0.05em' }}>PRINCIPAL</span>
                    <span className="font-mono text-base font-bold block mt-1" style={{ color: t.text }}>
                      {formatRs(selectedLoan.amount)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
                    <span className="text-[10px] font-bold block" style={{ color: t.textMuted, letterSpacing: '0.05em' }}>BALANCE DUE</span>
                    <span className="font-mono text-base font-bold block mt-1" style={{ color: t.balance === 0 ? t.paid : t.overdue }}>
                      {formatRs(selectedLoan.balance)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
                    <span className="text-[10px] font-bold block" style={{ color: t.textMuted, letterSpacing: '0.05em' }}>ANNUAL INTEREST</span>
                    <span className="font-mono text-base font-bold block mt-1" style={{ color: t.accent }}>
                      {selectedLoan.interestRateAnnual || selectedLoan.interestRate || 0}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
                    <span className="text-[10px] font-bold block" style={{ color: t.textMuted, letterSpacing: '0.05em' }}>MONTHLY INTEREST</span>
                    <span className="font-mono text-base font-bold block mt-1" style={{ color: t.accent }}>
                      {selectedLoan.interestRateMonthly || ((selectedLoan.interestRateAnnual || selectedLoan.interestRate || 0) / 12).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Grid layout for Customer details vs Loan Installment details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Customer details */}
                  <div className="flex flex-col gap-3">
                    <h4 className="font-display text-xs font-bold" style={{ color: t.primary, letterSpacing: '0.05em' }}>
                      CUSTOMER ACCOUNT
                    </h4>
                    <div className="flex flex-col gap-2 p-4 rounded-2xl" style={{ border: `1px solid ${t.border}`, background: t.card }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Name:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.customer?.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Phone:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.customer?.phone}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>NIC / ID:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.customer?.nic || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Area:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.customer?.area || 'N/A'}</span>
                      </div>
                      <div className="text-xs mt-1 pt-2" style={{ borderTop: `1px solid ${t.border}`, color: t.textMuted }}>
                        <span className="block font-semibold mb-1">Address:</span>
                        <span className="block" style={{ color: t.text }}>{selectedLoan.customer?.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Loan parameters & agent details */}
                  <div className="flex flex-col gap-3">
                    <h4 className="font-display text-xs font-bold" style={{ color: t.primary, letterSpacing: '0.05em' }}>
                      INSTALLMENTS & ORIGINATION
                    </h4>
                    <div className="flex flex-col gap-2 p-4 rounded-2xl" style={{ border: `1px solid ${t.border}`, background: t.card }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Payment Method:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.paymentFrequency || 'Daily'} Installments</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Total Installments:</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.installments || 30}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Paid Installments:</span>
                        <span style={{ fontWeight: 600, color: t.paid }}>{selectedLoan.installmentsPaid || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: t.textMuted }}>Remaining Installments:</span>
                        <span style={{ fontWeight: 600, color: t.overdue }}>
                          {Math.max(0, (selectedLoan.installments || 30) - (selectedLoan.installmentsPaid || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
                        <span style={{ color: t.textMuted }}>Issued By (Agent):</span>
                        <span style={{ fontWeight: 600, color: t.text }}>{selectedLoan.createdBy?.name || 'Admin'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Ledger / History */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-display text-xs font-bold" style={{ color: t.primary, letterSpacing: '0.05em' }}>
                    PAYMENT HISTORY & STATEMENT
                  </h4>
                  {selectedLoan.payments && selectedLoan.payments.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: t.border }}>
                      <table className="w-full text-left text-xs">
                        <thead style={{ background: t.bgSubtle, color: t.textMuted }}>
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Collected By</th>
                            <th className="p-3">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLoan.payments.map((p, idx) => (
                            <tr key={idx} className="border-t last:border-b-0" style={{ borderColor: t.border, background: t.card }}>
                              <td className="p-3 font-mono">{new Date(p.collectedAt).toISOString().split('T')[0]}</td>
                              <td className="p-3 font-mono font-bold" style={{ color: t.paid }}>{formatRs(p.amount)}</td>
                              <td className="p-3">{p.collectedBy?.name || 'Agent'}</td>
                              <td className="p-3 italic" style={{ color: t.textMuted }}>{p.note || 'None'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl text-center text-xs" style={{ background: t.bgSubtle, color: t.textMuted }}>
                      No payments recorded yet for this loan.
                    </div>
                  )}
                </div>

                {/* Customer Report Printer button */}
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 btn-press"
                  style={{ background: t.bgSubtle, color: t.text, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: `1.5px solid ${t.border}` }}
                >
                  <Download size={16} />
                  Download Customer Account Statement (Print Report)
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

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

