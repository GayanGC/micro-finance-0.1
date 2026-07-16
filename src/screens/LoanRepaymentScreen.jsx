import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, Calendar,
  DollarSign, TrendingDown, RefreshCw, Printer, ArrowLeft,
  ChevronDown, ChevronUp, X, Save
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { formatRs } from '../theme.js';
import {
  getLoan, getLoanRepayments, generateRepaymentSchedule, payInstallment
} from '../api/client.js';

const STATUS_MAP = {
  paid:    { color: '#059669', bg: '#05966914', label: 'Paid' },
  pending: { color: '#D97706', bg: '#D9770614', label: 'Pending' },
  overdue: { color: '#DC2626', bg: '#DC262614', label: 'Overdue' },
  partial: { color: '#0891B2', bg: '#0891B214', label: 'Partial' },
};

function InstallmentBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status === 'paid'    && <CheckCircle2 size={11} />}
      {status === 'overdue' && <AlertCircle  size={11} />}
      {status === 'pending' && <Clock        size={11} />}
      {s.label}
    </span>
  );
}

function PaymentModal({ t, installment, onClose, onSave }) {
  const [amount, setAmount] = useState(installment.totalDue - installment.paidAmount);
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(installment._id, { paidAmount: amount, paidDate: date, remarks });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="modal-card" style={{
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 20, padding: 24, width: '100%', maxWidth: 420,
        boxShadow: t.shadowLg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: t.text }}>
            Record Payment
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: `${t.primary}08`, border: `1px solid ${t.primary}20`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 600 }}>Installment #{installment.installmentNo}</div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '1.1rem', fontWeight: 700, color: t.text }}>
            {formatRs(installment.totalDue)}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted }}>
            Due: {new Date(installment.dueDate).toLocaleDateString('en-LK')}
            {installment.paidAmount > 0 && ` · Already paid: ${formatRs(installment.paidAmount)}`}
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
          Payment Amount (Rs.)
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          style={{
            width: '100%', padding: '10px 12px',
            background: t.bgSubtle, border: `1.5px solid ${t.border}`,
            borderRadius: 10, color: t.text, fontSize: '0.9rem',
            fontFamily: "'IBM Plex Mono'", fontWeight: 600, marginBottom: 12,
          }}
        />

        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
          Payment Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px',
            background: t.bgSubtle, border: `1.5px solid ${t.border}`,
            borderRadius: 10, color: t.text, fontSize: '0.85rem', marginBottom: 12,
          }}
        />

        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: t.textMuted, marginBottom: 6 }}>
          Remarks (optional)
        </label>
        <input
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          placeholder="e.g. Cash payment"
          style={{
            width: '100%', padding: '10px 12px',
            background: t.bgSubtle, border: `1.5px solid ${t.border}`,
            borderRadius: 10, color: t.text, fontSize: '0.85rem', marginBottom: 20,
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: `1.5px solid ${t.border}`, background: 'none',
            color: t.textMuted, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || amount <= 0} style={{
            flex: 2, padding: '10px', borderRadius: 10,
            background: t.primary, color: '#fff',
            border: 'none', fontSize: '0.85rem', fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins', opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function printSchedule(loan, repayments) {
  const customerName = loan.customer?.name || 'Unknown';
  const rows = repayments.map(r => `
    <tr style="background:${r.status === 'paid' ? '#f0fdf4' : r.status === 'overdue' ? '#fef2f2' : 'white'}">
      <td>${r.installmentNo}</td>
      <td>${new Date(r.dueDate).toLocaleDateString('en-LK')}</td>
      <td>${r.principalAmount?.toLocaleString('en-LK')}</td>
      <td>${r.interestAmount?.toLocaleString('en-LK')}</td>
      <td><b>${r.totalDue?.toLocaleString('en-LK')}</b></td>
      <td>${r.paidAmount > 0 ? r.paidAmount?.toLocaleString('en-LK') : '—'}</td>
      <td>${r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-LK') : '—'}</td>
      <td><b>${r.status.toUpperCase()}</b></td>
    </tr>`).join('');

  const total = repayments.reduce((s, r) => s + r.totalDue, 0);
  const paid  = repayments.reduce((s, r) => s + r.paidAmount, 0);

  const html = `<html><head><title>Repayment Schedule - ${customerName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; font-size: 12px; }
    h2 { text-align: center; }
    .meta { display: flex; justify-content: space-between; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #1A56DB; color: white; padding: 8px; text-align: left; }
    td { border: 1px solid #ddd; padding: 6px 8px; }
    .summary { display: flex; gap: 32px; margin-top: 20px; font-size: 13px; }
    .summary div { background: #f5f5f5; padding: 10px 16px; border-radius: 8px; }
  </style></head><body>
  <h2>Loan Repayment Schedule</h2>
  <div class="meta">
    <div><b>Customer:</b> ${customerName}</div>
    <div><b>Loan Amount:</b> Rs. ${loan.amount?.toLocaleString('en-LK')}</div>
    <div><b>Type:</b> ${loan.type}</div>
    <div><b>Frequency:</b> ${loan.paymentFrequency}</div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Due Date</th><th>Principal</th><th>Interest</th>
      <th>Total Due</th><th>Paid</th><th>Paid Date</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="summary">
    <div>Total Due: <b>Rs. ${total.toLocaleString('en-LK')}</b></div>
    <div>Total Paid: <b>Rs. ${paid.toLocaleString('en-LK')}</b></div>
    <div>Outstanding: <b>Rs. ${(total - paid).toLocaleString('en-LK')}</b></div>
  </div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1100,height=700');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export default function LoanRepaymentScreen({ t, loanId, onBack, onToggleTheme }) {
  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    if (!loanId) return;
    setLoading(true);
    setError('');
    try {
      const [loanRes, repRes] = await Promise.all([
        getLoan(loanId),
        getLoanRepayments(loanId),
      ]);
      if (loanRes?.success) setLoan(loanRes.data);
      if (repRes?.success)  {
        setRepayments(repRes.data);
        setSummary(repRes.summary);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRepaymentSchedule(loanId);
      if (res?.success) {
        showToast(`✅ Generated ${res.count} installments`);
        load();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id, data) => {
    try {
      await payInstallment(id, data);
      showToast('✅ Payment recorded');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const progressPct = summary ? Math.round((summary.paid / (summary.total || 1)) * 100) : 0;
  const paidPct     = summary ? Math.round(((summary.totalPaid) / (summary.totalDue || 1)) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Repayment Schedule" onBack={onBack} onToggleTheme={onToggleTheme} />
        <div className="flex-1 px-4 py-6 flex flex-col gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="animate-pulse h-16 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Repayment Schedule" onBack={onBack} onToggleTheme={onToggleTheme} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: t.primary, color: '#fff', padding: '10px 20px',
          borderRadius: 12, zIndex: 999, fontSize: '0.85rem', fontWeight: 600,
          boxShadow: t.shadowMd,
        }}>{toast}</div>
      )}

      {/* Pay modal */}
      {payingId && (
        <PaymentModal
          t={t}
          installment={repayments.find(r => r._id === payingId)}
          onClose={() => setPayingId(null)}
          onSave={handlePay}
        />
      )}

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto' }}>
        <div className="max-w-4xl mx-auto w-full px-4 lg:px-6">

          {/* Loan info card */}
          {loan && (
            <div style={{
              background: t.gradientCard || t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '20px 24px',
              marginTop: 20, marginBottom: 20,
              boxShadow: t.shadowMd,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Loan Details
                  </div>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: t.text }}>
                    {loan.customer?.name || 'Customer'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: t.textMuted }}>
                    {loan.type} · {loan.paymentFrequency} · {loan.installments} installments
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: '1.5rem', color: t.primary }}>
                    {formatRs(loan.amount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: t.textMuted }}>@ {loan.interestRate || 0}% interest</div>
                </div>
              </div>

              {/* Progress bar */}
              {summary && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ color: t.textMuted }}>Repayment Progress</span>
                    <span style={{ color: t.primary }}>{progressPct}% ({summary.paid}/{summary.total} installments)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPct}%`, background: t.gradientPrimary || t.primary }} />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div style={{ textAlign: 'center', padding: '10px', background: t.bgSubtle, borderRadius: 10 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.success }}>{formatRs(summary.totalPaid)}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600 }}>Paid</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: t.bgSubtle, borderRadius: 10 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.overdue }}>{formatRs(summary.totalOutstanding)}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600 }}>Outstanding</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: t.bgSubtle, borderRadius: 10 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.overdue }}>{summary.overdue}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600 }}>Overdue</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px', background: t.bgSubtle, borderRadius: 10 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.pending }}>{summary.pending}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600 }}>Pending</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {repayments.length === 0 && (
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px', borderRadius: 10,
                      background: t.primary, color: '#fff',
                      border: 'none', fontSize: '0.82rem', fontWeight: 700,
                      cursor: generating ? 'not-allowed' : 'pointer',
                      fontFamily: 'Poppins', opacity: generating ? 0.7 : 1,
                    }}
                  >
                    {generating ? <RefreshCw size={14} className="animate-spin" /> : <Calendar size={14} />}
                    {generating ? 'Generating...' : 'Generate Schedule'}
                  </button>
                )}
                {repayments.length > 0 && (
                  <button
                    onClick={() => printSchedule(loan, repayments)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10,
                      border: `1.5px solid ${t.accent}50`, background: `${t.accent}10`,
                      color: t.accent, fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Poppins',
                    }}
                  >
                    <Printer size={14} /> Print Schedule
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: `${t.danger}10`, border: `1px solid ${t.danger}30`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
              color: t.danger, fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Installments list */}
          {repayments.length === 0 && !loading ? (
            <div style={{
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: '40px', textAlign: 'center',
              boxShadow: t.shadow,
            }}>
              <Calendar size={36} color={t.textMuted} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, color: t.text, marginBottom: 4 }}>No repayment schedule yet</div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted }}>Click "Generate Schedule" above to create the repayment plan.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Installment Schedule
                </h3>
                <span style={{ fontSize: '0.75rem', color: t.textMuted }}>{repayments.length} installments</span>
              </div>

              {repayments.map(r => {
                const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
                const isExpanded = expandedId === r._id;
                const outstanding = r.totalDue - r.paidAmount;

                return (
                  <div key={r._id} style={{
                    background: t.card,
                    border: `1.5px solid ${r.status === 'overdue' ? t.overdue + '40' : isExpanded ? t.primary + '40' : t.border}`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: r.status === 'overdue' ? `0 2px 12px ${t.overdue}15` : t.shadow,
                    transition: 'all 0.2s ease',
                  }}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', cursor: 'pointer',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : r._id)}
                    >
                      {/* Installment number circle */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: r.status === 'paid' ? `${t.success}18` : r.status === 'overdue' ? `${t.overdue}18` : t.bgSubtle,
                        border: `2px solid ${s.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: '0.85rem',
                        color: s.color,
                      }}>
                        {r.status === 'paid' ? <CheckCircle2 size={18} color={t.success} /> : r.installmentNo}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: t.text }}>
                          Installment #{r.installmentNo}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: t.textMuted }}>
                          Due: {new Date(r.dueDate).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {r.paidDate && ` · Paid: ${new Date(r.paidDate).toLocaleDateString('en-LK')}`}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: '0.9rem', color: t.text }}>
                          {formatRs(r.totalDue)}
                        </div>
                        {r.status !== 'paid' && outstanding > 0 && (
                          <div style={{ fontSize: '0.68rem', color: t.overdue, fontWeight: 600 }}>
                            Outstanding: {formatRs(outstanding)}
                          </div>
                        )}
                      </div>

                      <InstallmentBadge status={r.status} />

                      <div style={{ color: t.textMuted, flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${t.border}`, background: `${t.primary}03` }}>
                        <div className="grid grid-cols-3 gap-3 mt-3 mb-4">
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>Principal</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.text, fontSize: '0.85rem' }}>{formatRs(r.principalAmount)}</div>
                          </div>
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>Interest</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.accent, fontSize: '0.85rem' }}>{formatRs(r.interestAmount)}</div>
                          </div>
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>Paid Amount</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.success, fontSize: '0.85rem' }}>{formatRs(r.paidAmount)}</div>
                          </div>
                        </div>

                        {r.remarks && (
                          <div style={{ fontSize: '0.78rem', color: t.textMuted, background: t.bgSubtle, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                            Note: {r.remarks}
                          </div>
                        )}

                        {r.status !== 'paid' && (
                          <button
                            onClick={() => setPayingId(r._id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '8px 16px', borderRadius: 10,
                              background: t.primary, color: '#fff',
                              border: 'none', fontSize: '0.8rem', fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'Poppins',
                            }}
                          >
                            <DollarSign size={14} /> Record Payment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
