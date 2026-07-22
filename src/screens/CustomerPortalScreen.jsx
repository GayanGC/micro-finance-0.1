import { useState, useEffect, useCallback, useContext } from 'react';
import {
  CreditCard, User, DollarSign, Calendar, Clock,
  CheckCircle2, AlertCircle, Printer, RefreshCw, LogOut,
  ChevronDown, ChevronUp, BookOpen, ShieldCheck, FileText, Phone, MapPin
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';
import {
  getCustomerPortalProfile,
  getCustomerPortalLoans,
  getCustomerPortalRepayments
} from '../api/client.js';
import { AuthContext } from '../context/AuthContext.jsx';

// ── Passbook Printer ─────────────────────────────────────────────────────────
function printDigitalPassbook(profile, loans) {
  const customerName = profile?.name || 'Customer';
  const nic = profile?.nic || 'N/A';
  const phone = profile?.phone || 'N/A';

  const loanRows = (loans || []).map((l, i) => {
    const rep = l.repaymentSummary || {};
    return `
      <tr>
        <td><b>#${i + 1}</b></td>
        <td>${l.type} Loan</td>
        <td>${l.policy?.title || 'Standard Policy'}</td>
        <td>Rs. ${l.amount?.toLocaleString('en-LK')}</td>
        <td>${rep.monthlyInterestRate || 0}%</td>
        <td>Rs. ${(rep.installmentSettlementAmount || 0).toLocaleString('en-LK')}</td>
        <td>Rs. ${(l.balance || 0).toLocaleString('en-LK')}</td>
        <td><b style="color:${l.status === 'paid' ? '#059669' : l.status === 'overdue' ? '#DC2626' : '#1A56DB'}">${(l.status || '').toUpperCase()}</b></td>
      </tr>
    `;
  }).join('');

  const html = `<html><head><title>Digital Loan Passbook - ${customerName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; font-size: 13px; }
    .header { border-bottom: 3px solid #1A56DB; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .company { font-size: 22px; font-weight: 800; color: #1A56DB; letter-spacing: -0.5px; }
    .subtitle { font-size: 12px; color: #64748b; font-weight: 600; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #1A56DB; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 48px; border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .sign-box { border-top: 1px solid #000; width: 180px; text-align: center; padding-top: 4px; font-weight: bold; }
  </style></head><body>
  <div class="header">
    <div>
      <div class="company">MicroFinance Passbook Ledger</div>
      <div class="subtitle">Official Customer Passbook & Monthly Settlement Statement</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:bold">Date: ${new Date().toLocaleDateString('en-LK')}</div>
      <div style="font-size:11px;color:#64748b">Verified Account</div>
    </div>
  </div>

  <div class="card">
    <div style="font-size:14px;font-weight:bold;margin-bottom:8px;color:#1A56DB">Customer Account Details</div>
    <div class="grid">
      <div><b>Customer Name:</b> ${customerName}</div>
      <div><b>NIC Number:</b> ${nic}</div>
      <div><b>Phone Number:</b> ${phone}</div>
      <div><b>Address:</b> ${profile?.address || 'N/A'}</div>
      <div><b>Branch / Area:</b> ${profile?.area || 'Main Branch'}</div>
      <div><b>Active Loans:</b> ${profile?.activeCount || 0}</div>
    </div>
  </div>

  <div style="font-size:14px;font-weight:bold;margin-bottom:8px">Loan Portfolio & Monthly Settlement Summary</div>
  <table>
    <thead><tr>
      <th>#</th><th>Loan Type</th><th>Policy / Scheme</th><th>Principal</th>
      <th>Monthly Interest</th><th>Monthly Settlement</th><th>Balance Due</th><th>Status</th>
    </tr></thead>
    <tbody>${loanRows}</tbody>
  </table>

  <div class="footer">
    <div>Issued electronically by MicroFinance System.</div>
    <div class="sign-box">Customer Signature</div>
    <div class="sign-box">Authorized Officer Signature</div>
  </div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1000,height=750');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export default function CustomerPortalScreen({ t, onToggleTheme }) {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile]     = useState(null);
  const [loans, setLoans]         = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [repaymentsMap, setRepaymentsMap]   = useState({});
  const [loadingRepayments, setLoadingRepayments] = useState(false);

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profRes, loansRes] = await Promise.all([
        getCustomerPortalProfile().catch(() => null),
        getCustomerPortalLoans(),
      ]);

      if (profRes?.success) setProfile(profRes.data);
      if (loansRes?.success) {
        setLoans(loansRes.data);
        setSummary(loansRes.summary);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer portal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPortalData(); }, [loadPortalData]);

  const toggleLoanExpand = async (loanId) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null);
      return;
    }
    setExpandedLoanId(loanId);

    if (!repaymentsMap[loanId]) {
      setLoadingRepayments(true);
      try {
        const res = await getCustomerPortalRepayments(loanId);
        if (res?.success) {
          setRepaymentsMap(prev => ({ ...prev, [loanId]: res.data }));
        }
      } catch (err) {
        console.error('Error fetching repayments:', err);
      } finally {
        setLoadingRepayments(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Customer Portal" onToggleTheme={onToggleTheme} />
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col gap-4">
          <div className="animate-pulse h-32 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
          <div className="animate-pulse h-24 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
          <div className="animate-pulse h-64 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen screen-enter" style={{ background: t.bg }}>
      {/* Portal Header */}
      <div
        style={{
          background: t.card,
          borderBottom: `1px solid ${t.border}`,
          padding: '16px 24px',
          boxShadow: t.shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 42, height: 42, borderRadius: 14,
              background: t.gradientPrimary || `linear-gradient(135deg, ${t.primary}, ${t.primary}CC)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontFamily: 'Poppins', fontSize: '1rem',
              boxShadow: `0 4px 14px ${t.primary}44`,
            }}
          >
            MF
          </div>
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.1rem', color: t.text, lineHeight: 1.2 }}>
              Customer Loan Portal
            </h1>
            <p style={{ fontSize: '0.75rem', color: t.textMuted }}>
              Passbook Ledger & Monthly Settlement Statement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl btn-press"
            style={{ background: t.bgSubtle, border: `1px solid ${t.border}`, cursor: 'pointer' }}
          >
            {t.mode === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl btn-press"
            style={{
              background: `${t.overdue}15`, border: `1px solid ${t.overdue}30`,
              color: t.overdue, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Poppins',
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">

          {/* 1. Customer Profile Card */}
          <div
            className="rounded-3xl p-6"
            style={{
              background: t.gradientHero || `linear-gradient(135deg, ${t.primary}0D, ${t.accent}06)`,
              border: `1.5px solid ${t.primary}20`,
              boxShadow: t.shadowMd,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: t.gradientPrimary || t.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem',
                    boxShadow: `0 6px 20px ${t.primary}40`,
                    flexShrink: 0,
                  }}
                >
                  {(profile?.name || user?.name || 'C').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    VALUED CUSTOMER
                  </div>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.35rem', color: t.text }}>
                    {profile?.name || user?.name || 'Customer Profile'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs" style={{ color: t.textMuted }}>
                    {profile?.nic && <span className="flex items-center gap-1"><ShieldCheck size={13} color={t.primary}/> NIC: <b>{profile.nic}</b></span>}
                    {profile?.phone && <span className="flex items-center gap-1"><Phone size={13} color={t.accent}/> Phone: <b>{profile.phone}</b></span>}
                    {profile?.area && <span className="flex items-center gap-1"><MapPin size={13} color={t.info}/> Area: <b>{profile.area}</b></span>}
                  </div>
                </div>
              </div>

              {/* Print Digital Passbook Button */}
              <button
                onClick={() => printDigitalPassbook(profile, loans)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl btn-press"
                style={{
                  background: t.primary, color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: '0.85rem',
                  fontFamily: 'Poppins', boxShadow: `0 4px 16px ${t.primary}40`,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Printer size={16} /> Print Passbook Statement
              </button>
            </div>
          </div>

          {/* 2. Monthly Settlement & Balance KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: t.card, border: `1.5px solid ${t.border}`, boxShadow: t.shadow }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Balance Due
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.overdue}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} color={t.overdue} />
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '1.4rem', fontWeight: 800, color: t.overdue }}>
                {formatRs(summary?.totalBalance || profile?.totalBalance || 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 4 }}>
                Total remaining across all loans
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: t.card, border: `1.5px solid ${t.primary}30`, boxShadow: t.shadowMd }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Monthly Settlement Due
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color={t.primary} />
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '1.4rem', fontWeight: 800, color: t.primary }}>
                {formatRs(summary?.monthlySettlementTotal || 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 4 }}>
                Active monthly installment total
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: t.card, border: `1.5px solid ${t.border}`, boxShadow: t.shadow }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Active Loans
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${t.success}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} color={t.success} />
                </div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '1.4rem', fontWeight: 800, color: t.text }}>
                {summary?.activeLoansCount || profile?.activeCount || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 4 }}>
                Total active borrowing facilities
              </div>
            </div>
          </div>

          {/* 3. Customer Active Loans List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: t.text }}>
                My Loans & Repayment Schedules
              </h3>
              <button onClick={loadPortalData} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: t.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: `${t.overdue}15`, border: `1px solid ${t.overdue}30`, color: t.overdue }}>
                <AlertCircle size={18} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            {loans.length === 0 ? (
              <div className="rounded-3xl p-12 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                <CreditCard size={40} color={t.textMuted} strokeWidth={1.5} className="mx-auto mb-3" />
                <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.text }}>No loans on record</h4>
                <p style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 4 }}>
                  You currently have no active or historical loans registered under your profile.
                </p>
              </div>
            ) : (
              loans.map(loan => {
                const rep = loan.repaymentSummary || {};
                const isExpanded = expandedLoanId === loan._id;
                const schedule = repaymentsMap[loan._id] || [];
                const progressPct = Math.round(((loan.amount - loan.balance) / (loan.amount || 1)) * 100);

                return (
                  <div
                    key={loan._id}
                    className="rounded-3xl overflow-hidden transition-all duration-200"
                    style={{
                      background: t.card,
                      border: `1.5px solid ${isExpanded ? t.primary + '50' : t.border}`,
                      boxShadow: isExpanded ? t.shadowMd : t.shadow,
                    }}
                  >
                    {/* Loan Main Header Bar */}
                    <div
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => toggleLoanExpand(loan._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          style={{
                            width: 48, height: 48, borderRadius: 16,
                            background: `${t.primary}12`, border: `1.5px solid ${t.primary}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: t.primary, flexShrink: 0,
                          }}
                        >
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: t.text }}>
                              {loan.type} Loan Scheme
                            </h4>
                            <Stamp t={t} status={loan.status} />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>
                            {loan.policy?.title ? `Policy: ${loan.policy.title}` : `Frequency: ${loan.paymentFrequency}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase' }}>
                            Monthly Settlement
                          </div>
                          <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 800, fontSize: '1.1rem', color: t.primary }}>
                            {formatRs(rep.installmentSettlementAmount || 0)}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: t.textMuted }}>
                            Interest: {rep.monthlyInterestRate || 0}% ({formatRs(rep.monthlyInterestAmount || 0)}/mo)
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase' }}>
                            Balance Due
                          </div>
                          <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 800, fontSize: '1.1rem', color: loan.balance === 0 ? t.paid : t.overdue }}>
                            {formatRs(loan.balance)}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: t.textMuted }}>
                            Of {formatRs(loan.amount)} Principal
                          </div>
                        </div>

                        <div className="p-2 rounded-xl" style={{ background: t.bgSubtle, color: t.textMuted }}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-5 pb-2">
                      <div className="flex justify-between text-xs font-bold mb-1" style={{ color: t.textMuted }}>
                        <span>REPAYMENT PROGRESS</span>
                        <span style={{ color: t.primary }}>{progressPct}% Repaid ({rep.paidInstallments}/{rep.totalInstallments} Installments)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%`, background: t.gradientPrimary || t.primary }} />
                      </div>
                    </div>

                    {/* Expanded Repayment Schedule */}
                    {isExpanded && (
                      <div className="p-5 border-t flex flex-col gap-4" style={{ borderColor: t.border, background: t.bgSubtle }}>
                        <div className="flex items-center justify-between">
                          <h5 className="font-display text-xs font-bold" style={{ color: t.primary, letterSpacing: '0.05em' }}>
                            INSTALLMENT AMORTIZATION SCHEDULE
                          </h5>
                          <span style={{ fontSize: '0.72rem', color: t.textMuted }}>
                            Next Due: <b>{rep.nextDueDate ? new Date(rep.nextDueDate).toLocaleDateString('en-LK') : 'N/A'}</b>
                          </span>
                        </div>

                        {loadingRepayments ? (
                          <div className="p-6 text-center text-xs font-bold" style={{ color: t.textMuted }}>
                            Loading repayment schedule...
                          </div>
                        ) : schedule.length === 0 ? (
                          <div className="p-6 text-center text-xs" style={{ background: t.card, borderRadius: 14, color: t.textMuted }}>
                            No generated schedule found for this loan.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: t.border, background: t.card }}>
                            <table className="w-full text-left text-xs">
                              <thead style={{ background: t.bgSubtle, color: t.textMuted }}>
                                <tr>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Due Date</th>
                                  <th className="p-3">Principal</th>
                                  <th className="p-3">Interest</th>
                                  <th className="p-3">Total Due</th>
                                  <th className="p-3">Paid Amount</th>
                                  <th className="p-3">Paid Date</th>
                                  <th className="p-3">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {schedule.map(item => (
                                  <tr key={item._id} className="border-t" style={{ borderColor: t.border }}>
                                    <td className="p-3 font-mono font-bold">{item.installmentNo}</td>
                                    <td className="p-3 font-mono">{new Date(item.dueDate).toLocaleDateString('en-LK')}</td>
                                    <td className="p-3 font-mono">{formatRs(item.principalAmount)}</td>
                                    <td className="p-3 font-mono" style={{ color: t.accent }}>{formatRs(item.interestAmount)}</td>
                                    <td className="p-3 font-mono font-bold" style={{ color: t.text }}>{formatRs(item.totalDue)}</td>
                                    <td className="p-3 font-mono font-bold" style={{ color: t.paid }}>{item.paidAmount > 0 ? formatRs(item.paidAmount) : '—'}</td>
                                    <td className="p-3 font-mono">{item.paidDate ? new Date(item.paidDate).toLocaleDateString('en-LK') : '—'}</td>
                                    <td className="p-3">
                                      <span
                                        className="badge"
                                        style={{
                                          background: item.status === 'paid' ? `${t.paid}18` : item.status === 'overdue' ? `${t.overdue}18` : `${t.pending}18`,
                                          color: item.status === 'paid' ? t.paid : item.status === 'overdue' ? t.overdue : t.pending,
                                          border: `1px solid ${item.status === 'paid' ? t.paid + '40' : item.status === 'overdue' ? t.overdue + '40' : t.pending + '40'}`,
                                        }}
                                      >
                                        {item.status.toUpperCase()}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
