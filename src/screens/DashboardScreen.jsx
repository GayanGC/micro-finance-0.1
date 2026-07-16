import { useState, useEffect, useContext, useCallback } from 'react';
import {
  CreditCard, HandCoins, BarChart2, TrendingUp,
  AlertCircle, UserCheck, CalendarOff, Users,
  CalendarDays, ArrowRight, FileText, RefreshCw,
  Menu, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs, formatShort } from '../theme.js';
import {
  getReportSummary, getLoans, getEmployeeStats,
  getReportTrend, getReportBreakdown
} from '../api/client.js';
import { AuthContext } from '../context/AuthContext.jsx';

/* ─── Greeting helper ─────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Section header with accent bar ─────────────────────── */
function SectionLabel({ t, children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div style={{
          width: 4, height: 20, borderRadius: 99,
          background: t.gradientPrimary || t.primary, flexShrink: 0,
        }} />
        <h3 style={{
          fontFamily: 'Poppins', fontWeight: 700,
          fontSize: '0.78rem', color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.09em',
        }}>
          {children}
        </h3>
      </div>
      {action}
    </div>
  );
}

/* ─── Quick Action tile ───────────────────────────────────── */
function QuickAction({ t, icon: Icon, label, color, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl p-4 btn-press w-full"
      style={{
        background: hovered ? `${color}08` : t.card,
        border: `1.5px solid ${hovered ? color + '45' : t.border}`,
        minHeight: 108,
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 10px 28px ${color}1A` : t.shadow,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle BG glow */}
      <div style={{
        position: 'absolute', top: -24, right: -24,
        width: 80, height: 80, borderRadius: '50%',
        background: `${color}08`, pointerEvents: 'none',
      }} />
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: `linear-gradient(135deg, ${color}22, ${color}0D)`,
        border: `1.5px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={color} strokeWidth={2} />
      </div>
      <span style={{
        fontSize: '0.75rem', fontWeight: 700, color: t.text,
        textAlign: 'center', lineHeight: 1.3, fontFamily: 'Inter',
      }}>
        {label}
      </span>
    </button>
  );
}

/* ─── Recent loan row card ────────────────────────────────── */
function RecentLoanCard({ t, loan }) {
  const name = loan.customer?.name || loan.customerName || 'Unknown';
  const area = loan.customer?.area || loan.area || '';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const status = loan.status
    ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
    : 'Pending';

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl p-3.5 transition-all duration-200"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(3px)';
        e.currentTarget.style.boxShadow = t.shadowMd;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = t.shadow;
      }}
    >
      {/* Avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${t.primary}25, ${t.primary}0D)`,
          border: `2px solid ${t.primary}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.85rem', color: t.primary,
        }}>
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate"
            style={{ fontWeight: 700, fontSize: '0.88rem', color: t.text, fontFamily: 'Poppins' }}>
            {name}
          </div>
          <div className="truncate"
            style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>
            {loan.type}{area ? ` · ${area}` : ''}
          </div>
        </div>
      </div>
      {/* Balance + status */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
          fontSize: '0.88rem', color: t.text,
        }}>
          {formatRs(loan.balance)}
        </span>
        <Stamp t={t} status={status} />
      </div>
    </div>
  );
}

/* ─── Custom recharts tooltip ─────────────────────────────── */
function CustomTooltip({ active, payload, label, t, isAmount }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '10px 14px', boxShadow: t.shadowMd,
      fontFamily: 'Inter', fontSize: '0.78rem',
    }}>
      <div style={{ fontWeight: 600, color: t.textMuted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {isAmount ? formatRs(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════ */
export default function DashboardScreen({ t, onNavigate, onToggleTheme, onOpenSettings, onOpenMobileNav }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [summary, setSummary]         = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [hrStats, setHrStats]         = useState(null);
  const [trendData, setTrendData]     = useState([]);
  const [pieData, setPieData]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, loansRes, hrRes, trendRes, breakRes] = await Promise.all([
        getReportSummary(),
        getLoans(),
        isAdmin ? getEmployeeStats() : Promise.resolve(null),
        getReportTrend().catch(() => null),
        getReportBreakdown().catch(() => null),
      ]);
      if (sumRes?.success)   setSummary(sumRes.data);
      if (loansRes?.success) setRecentLoans(loansRes.data.slice(0, 5));
      if (hrRes?.success)    setHrStats(hrRes.data);
      if (trendRes?.success) setTrendData(trendRes.data || []);
      if (breakRes?.success) setPieData(breakRes.data   || []);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Derived values ── */
  const {
    totalLoans = 0, activeLoans = 0,
    overdueCount = 0, todayCollections = 0,
  } = summary || {};

  /* Fallback chart data when API returns nothing */
  const chartTrend = trendData.length > 0 ? trendData : [
    { month: 'Feb', collections: 0, loans: 0 },
    { month: 'Mar', collections: 0, loans: 0 },
    { month: 'Apr', collections: 0, loans: 0 },
    { month: 'May', collections: 0, loans: 0 },
    { month: 'Jun', collections: 0, loans: 0 },
    { month: 'Jul', collections: 0, loans: 0 },
  ];

  const donutData = pieData.length > 0 ? pieData : [
    { name: 'Active',  value: activeLoans,  color: t.active  },
    { name: 'Overdue', value: overdueCount, color: t.overdue },
    { name: 'Pending', value: Math.max(0, totalLoans - activeLoans - overdueCount), color: t.pending },
  ].filter(d => d.value > 0);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings} onOpenMobileNav={onOpenMobileNav} />
        <div className="flex-1 p-4 md:p-8" style={{ overflowY: 'auto' }}>
          <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
            <div className="animate-pulse h-28 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-32 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse h-28 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="animate-pulse lg:col-span-2 h-64 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
              <div className="animate-pulse h-64 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings} onOpenMobileNav={onOpenMobileNav} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <AlertCircle size={48} color={t.overdue} />
          <p style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.text }}>
            Failed to Load Dashboard
          </p>
          <p style={{ fontSize: '0.82rem', color: t.overdue, textAlign: 'center', maxWidth: 360 }}>{error}</p>
          <button onClick={fetchData} style={{
            marginTop: 8, padding: '10px 24px', background: t.primary, color: '#fff',
            border: 'none', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ═══ MAIN RENDER ═══ */
  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>

      {/* ── Top bar ── */}
      <TopBar
        t={t}
        title="Dashboard"
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
        onOpenMobileNav={onOpenMobileNav}
      />

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-10">
        {/* Constrained container */}
        <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">

          {/* ══ 1. GREETING HERO ══ */}
          <div
            className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{
              background: t.gradientHero
                || `linear-gradient(135deg, ${t.primary}0A 0%, ${t.accent}06 100%)`,
              border: `1px solid ${t.primary}18`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* BG decorative blobs */}
            <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:`${t.primary}06`, pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-20, left:-10, width:120, height:120, borderRadius:'50%', background:`${t.accent}05`, pointerEvents:'none' }} />

            {/* Text */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontFamily: 'Poppins', fontWeight: 800,
                fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
                color: t.text, lineHeight: 1.2, marginBottom: 4,
              }}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Agent'} 👋
              </h2>
              <p style={{ fontSize: '0.82rem', color: t.textMuted }}>
                {new Date().toLocaleDateString('en-LK', {
                  weekday: 'long', year: 'numeric',
                  month: 'long', day: 'numeric',
                })}
              </p>
            </div>

            {/* Right-side badge */}
            <div className="flex flex-wrap gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
              {overdueCount > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 99,
                  background: `${t.overdue}14`, border: `1.5px solid ${t.overdue}35`,
                  color: t.overdue, fontSize: '0.78rem', fontWeight: 700,
                }}>
                  <AlertCircle size={14} />
                  {overdueCount} overdue loan{overdueCount > 1 ? 's' : ''} need attention
                </div>
              )}
              <button
                onClick={fetchData}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 99,
                  background: `${t.primary}12`, border: `1.5px solid ${t.primary}30`,
                  color: t.primary, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* ══ 2. KPI STAT CARDS ══ */}
          <div>
            <SectionLabel t={t}>Portfolio Overview</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard t={t} label="Total Loans"         value={totalLoans}       icon={CreditCard}  />
              <StatCard t={t} label="Active Loans"        value={activeLoans}      icon={TrendingUp}  iconColor={t.active} />
              <StatCard t={t} label="Today's Collections" value={todayCollections} icon={HandCoins}   isAmount accent />
              <StatCard t={t} label="Overdue"             value={overdueCount}     icon={AlertCircle} iconColor={t.overdue} />
            </div>
          </div>

          {/* ══ 3. QUICK ACTIONS ══ */}
          <div>
            <SectionLabel t={t}>Quick Actions</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <QuickAction t={t} icon={CreditCard}  label="New Loan"    color={t.primary}  onClick={() => onNavigate('newloan')} />
              <QuickAction t={t} icon={HandCoins}   label="Collections" color={t.accent}   onClick={() => onNavigate('collection')} />
              <QuickAction t={t} icon={BarChart2}   label="Reports"     color={t.success}  onClick={() => onNavigate('reports')} />
              <QuickAction t={t} icon={UserCheck}   label="Employees"   color="#7C3AED"    onClick={() => onNavigate('employees')} />
              <QuickAction t={t} icon={FileText}    label="ETF / EPF"   color={t.info}     onClick={() => onNavigate('etfepf')} />
              <QuickAction t={t} icon={CalendarOff} label="Leave"       color={t.overdue}  onClick={() => onNavigate('leave')} />
            </div>
          </div>

          {/* ══ 4. ANALYTICS CHARTS ══ */}
          <div>
            <SectionLabel t={t}>Analytics</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Area chart — 2/3 */}
              <div
                className="lg:col-span-2 rounded-2xl p-5 md:p-6"
                style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
              >
                <div className="mb-4">
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: t.text }}>
                    Collections Trend
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>
                    Monthly collections vs disbursement
                  </p>
                </div>
                {/* Chart wrapper — fixed height prevents overflow */}
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartTrend}
                      margin={{ top: 6, right: 6, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gCollections" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={t.primary} stopOpacity={0.28} />
                          <stop offset="95%" stopColor={t.primary} stopOpacity={0}    />
                        </linearGradient>
                        <linearGradient id="gLoans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={t.accent} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={t.accent} stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatShort(v)} />
                      <Tooltip content={<CustomTooltip t={t} isAmount />} />
                      <Area type="monotone" dataKey="collections" name="Collections"
                        stroke={t.primary} strokeWidth={2.5}
                        fill="url(#gCollections)" dot={false}
                        activeDot={{ r: 5, fill: t.primary, stroke: t.card, strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="loans" name="Disbursed"
                        stroke={t.accent} strokeWidth={2}
                        fill="url(#gLoans)" dot={false}
                        activeDot={{ r: 4, fill: t.accent, stroke: t.card, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-5 mt-3 justify-center">
                  {[
                    { color: t.primary, label: 'Collections' },
                    { color: t.accent,  label: 'Disbursed'   },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div style={{ width: 24, height: 3, borderRadius: 99, background: item.color }} />
                      <span style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut chart — 1/3 */}
              <div
                className="rounded-2xl p-5 md:p-6 flex flex-col"
                style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
              >
                <div className="mb-4">
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: t.text }}>
                    Loan Portfolio
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>Status breakdown</p>
                </div>

                {donutData.length > 0 ? (
                  <>
                    {/* Donut — fixed height so it never crops */}
                    <div style={{ width: '100%', height: 180, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%" cy="50%"
                            innerRadius="52%"
                            outerRadius="78%"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {donutData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v, n) => [v, n]}
                            contentStyle={{
                              background: t.card, border: `1px solid ${t.border}`,
                              borderRadius: 10, fontSize: '0.78rem',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend list */}
                    <div className="flex flex-col gap-2.5 mt-4">
                      {donutData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div style={{
                              width: 10, height: 10, borderRadius: '50%',
                              background: d.color, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: '0.76rem', color: t.textMuted }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.text }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2"
                    style={{ color: t.textMuted, fontSize: '0.82rem' }}>
                    <BarChart2 size={32} strokeWidth={1.5} />
                    <span>No loan data</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ 5. HR OVERVIEW (admin only) ══ */}
          {isAdmin && hrStats && (
            <div>
              <SectionLabel t={t}>HR Overview</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard t={t} label="Total Employees" value={hrStats.totalEmployees ?? 0} icon={Users} />
                <StatCard t={t} label="Present Today"   value={hrStats.todayPresent   ?? 0} icon={CalendarDays} iconColor={t.active} />
                <StatCard t={t} label="Pending Leaves"  value={hrStats.pendingLeaves  ?? 0} icon={CalendarOff}  iconColor={t.pending} />
              </div>
            </div>
          )}

          {/* ══ 6. RECENT LOANS ══ */}
          <div>
            <SectionLabel
              t={t}
              action={
                <button
                  onClick={() => onNavigate('loans')}
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '0.75rem', color: t.primary,
                    fontWeight: 700, background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'Poppins',
                  }}
                >
                  View all <ArrowRight size={13} />
                </button>
              }
            >
              Recent Loans
            </SectionLabel>

            {recentLoans.length === 0 ? (
              <div
                className="rounded-2xl p-8 flex flex-col items-center gap-3"
                style={{ background: t.card, border: `1px solid ${t.border}` }}
              >
                <CreditCard size={32} color={t.textMuted} strokeWidth={1.5} />
                <span style={{ fontSize: '0.85rem', color: t.textMuted }}>No recent loans found.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentLoans.map(loan => (
                  <RecentLoanCard key={loan._id} t={t} loan={loan} />
                ))}
              </div>
            )}
          </div>

          {/* ══ 7. OVERDUE ALERT BANNER ══ */}
          {overdueCount > 0 && (
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: `${t.overdue}0B`,
                border: `1.5px solid ${t.overdue}28`,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: `${t.overdue}18`, border: `1px solid ${t.overdue}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={20} color={t.overdue} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: t.overdue }}>
                  {overdueCount} Overdue Loan{overdueCount > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.73rem', color: t.textMuted, marginTop: 2 }}>
                  Follow up with customers immediately.
                </div>
              </div>
              <button
                onClick={() => onNavigate('loans')}
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  fontSize: '0.76rem', color: t.overdue, fontWeight: 700,
                  background: 'none', border: `1.5px solid ${t.overdue}40`,
                  borderRadius: 10, cursor: 'pointer',
                  padding: '7px 14px', fontFamily: 'Poppins',
                }}
              >
                View <ArrowRight size={12} />
              </button>
            </div>
          )}

        </div>{/* /container */}
      </div>{/* /scrollable body */}
    </div>
  );
}
