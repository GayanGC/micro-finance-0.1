import { useState, useEffect, useContext } from 'react';
import {
  CreditCard, HandCoins, BarChart2, TrendingUp, TrendingDown,
  AlertCircle, UserCheck, CalendarDays, CalendarOff, Users,
  ArrowRight, FileText, RefreshCw, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs, formatShort } from '../theme.js';
import { getReportSummary, getLoans, getEmployeeStats, getReportTrend, getReportBreakdown } from '../api/client.js';
import { AuthContext } from '../context/AuthContext.jsx';

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickAction({ t, icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl p-4 btn-press w-full"
      style={{
        background: t.card,
        border: `1.5px solid ${t.border}`,
        cursor: 'pointer',
        minHeight: 100,
        transition: 'all 0.22s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`;
        e.currentTarget.style.borderColor = color + '55';
        e.currentTarget.style.background = `${color}06`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.background = t.card;
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `${color}08`,
      }} />
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 46, height: 46,
          background: `linear-gradient(135deg, ${color}20, ${color}0D)`,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <span style={{
        fontSize: '0.72rem', fontWeight: 700, color: t.text,
        textAlign: 'center', lineHeight: 1.3, maxWidth: '100%',
        fontFamily: 'Inter',
      }}>
        {label}
      </span>
    </button>
  );
}

function SectionLabel({ t, children, action }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: t.primary, flexShrink: 0 }} />
        <h3 style={{
          fontFamily: 'Poppins', fontWeight: 700,
          fontSize: '0.8rem', color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {children}
        </h3>
      </div>
      {action}
    </div>
  );
}

function RecentLoanCard({ t, loan }) {
  const customerName = loan.customer?.name || loan.customerName || 'Unknown';
  const area = loan.customer?.area || loan.area || '';
  const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const displayStatus = loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Pending';

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl p-3.5"
      style={{
        background: t.card, border: `1px solid ${t.border}`,
        boxShadow: t.shadow, transition: 'all 0.18s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowMd; e.currentTarget.style.transform = 'translateX(3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 44, height: 44,
            background: `linear-gradient(135deg, ${t.primary}22, ${t.primary}0D)`,
            border: `1.5px solid ${t.primary}30`,
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.88rem', color: t.primary,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: t.text, fontFamily: 'Poppins' }} className="truncate">
            {customerName}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }} className="truncate">
            {loan.type}{area ? ` · ${area}` : ''}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
          fontSize: '0.88rem', color: t.text,
        }}>
          {formatRs(loan.balance)}
        </span>
        <Stamp t={t} status={displayStatus} />
      </div>
    </div>
  );
}

// Custom chart tooltip
function ChartTooltip({ active, payload, label, t, isAmount }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '10px 14px',
      boxShadow: t.shadowMd,
      fontFamily: 'Inter', fontSize: '0.8rem',
    }}>
      <div style={{ fontWeight: 700, color: t.textMuted, marginBottom: 4, fontSize: '0.72rem' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {isAmount ? formatRs(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

// Donut center label
function CustomPieLabel({ cx, cy, t, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, fill: t.text }}>{total}</tspan>
      <tspan x={cx} dy="20" style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, fill: t.textMuted }}>Total Loans</tspan>
    </text>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardScreen({ t, onNavigate, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [summary, setSummary]         = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [hrStats, setHrStats]         = useState(null);
  const [trendData, setTrendData]     = useState([]);
  const [breakdown, setBreakdown]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, loansRes, hrRes, trendRes, breakRes] = await Promise.all([
        getReportSummary(),
        getLoans(),
        isAdmin ? getEmployeeStats() : Promise.resolve(null),
        getReportTrend().catch(() => null),
        getReportBreakdown().catch(() => null),
      ]);

      if (summaryRes?.success)  setSummary(summaryRes.data);
      if (loansRes?.success)    setRecentLoans(loansRes.data.slice(0, 5));
      if (hrRes?.success)       setHrStats(hrRes.data);
      if (trendRes?.success)    setTrendData(trendRes.data || []);
      if (breakRes?.success)    setBreakdown(breakRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // Fallback chart data when API not available
  const chartTrend = trendData.length > 0 ? trendData : [
    { month: 'Feb', collections: 0, loans: 0 },
    { month: 'Mar', collections: 0, loans: 0 },
    { month: 'Apr', collections: 0, loans: 0 },
    { month: 'May', collections: 0, loans: 0 },
    { month: 'Jun', collections: 0, loans: 0 },
    { month: 'Jul', collections: 0, loans: 0 },
  ];

  const { totalLoans = 0, activeLoans = 0, overdueCount = 0, todayCollections = 0 } = summary || {};

  const pieData = breakdown.length > 0 ? breakdown : [
    { name: 'Active',  value: activeLoans,              color: t.active },
    { name: 'Overdue', value: overdueCount,             color: t.overdue },
    { name: 'Pending', value: Math.max(0, totalLoans - activeLoans - overdueCount), color: t.pending },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="flex-1 px-4 py-6 flex flex-col gap-5 max-w-6xl mx-auto w-full lg:px-6" style={{ overflowY: 'auto' }}>
          <div className="animate-pulse rounded-2xl p-5 h-24" style={{ background: t.card, border: `1px solid ${t.border}` }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-32 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />)}
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {[1,2,3,4,5].map(i => <div key={i} className="animate-pulse rounded-2xl border" style={{ background: t.card, borderColor: t.border, minHeight: 100 }} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="animate-pulse h-64 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
          <AlertCircle size={48} color={t.overdue} />
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.text }}>Failed to Load Dashboard</h3>
          <p style={{ fontSize: '0.85rem', color: t.overdue, textAlign: 'center', maxWidth: '80%' }}>{error}</p>
          <button
            onClick={fetchDashboardData}
            style={{ marginTop: 12, padding: '10px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col">

          {/* Greeting hero banner */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: t.gradientHero || `linear-gradient(135deg, ${t.primary}10, ${t.accent}06)`,
              border: `1px solid ${t.primary}18`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: `${t.primary}06` }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: `${t.accent}06` }} />
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: t.text, lineHeight: 1.2, position: 'relative' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Agent'} 👋
            </h2>
            <p style={{ fontSize: '0.82rem', color: t.textMuted, marginTop: 6, position: 'relative' }}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {overdueCount > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 12, padding: '6px 14px', borderRadius: 99,
                background: `${t.overdue}15`, border: `1px solid ${t.overdue}35`,
                color: t.overdue, fontSize: '0.75rem', fontWeight: 700,
                position: 'relative',
              }}>
                <AlertCircle size={13} />
                {overdueCount} overdue loan{overdueCount > 1 ? 's' : ''} need attention
              </div>
            )}
          </div>

          {/* KPI Stat cards */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>Portfolio Overview</SectionLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard t={t} label="Total Loans"         value={totalLoans}         icon={CreditCard}   trend={null} />
              <StatCard t={t} label="Active Loans"        value={activeLoans}        icon={TrendingUp}   iconColor={t.active} />
              <StatCard t={t} label="Today's Collections" value={todayCollections}   icon={HandCoins}    isAmount accent />
              <StatCard t={t} label="Overdue"             value={overdueCount}       icon={AlertCircle}  iconColor={t.overdue} />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>Quick Actions</SectionLabel>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              <QuickAction t={t} icon={CreditCard}  label="New Loan"    color={t.primary}  onClick={() => onNavigate('newloan')} />
              <QuickAction t={t} icon={HandCoins}   label="Collections" color={t.accent}   onClick={() => onNavigate('collection')} />
              <QuickAction t={t} icon={BarChart2}   label="Reports"     color={t.success}  onClick={() => onNavigate('reports')} />
              <QuickAction t={t} icon={UserCheck}   label="Employees"   color={'#7C3AED'}  onClick={() => onNavigate('employees')} />
              <QuickAction t={t} icon={FileText}    label="ETF / EPF"   color={t.info}     onClick={() => onNavigate('etfepf')} />
              <QuickAction t={t} icon={CalendarOff} label="Leave"       color={t.overdue}  onClick={() => onNavigate('leave')} />
            </div>
          </div>

          {/* Charts row */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>Analytics</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Collections Trend — takes 2/3 width */}
              <div className="lg:col-span-2" style={{
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 20, padding: '20px 20px 12px',
                boxShadow: t.shadow,
              }}>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.text }}>Collections Trend</h4>
                  <p style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>Monthly collection vs disbursement</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradCollections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.primary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={t.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLoans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.accent} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatShort(v)} />
                    <Tooltip content={<ChartTooltip t={t} isAmount />} />
                    <Area type="monotone" dataKey="collections" name="Collections" stroke={t.primary} strokeWidth={2.5} fill="url(#gradCollections)" dot={false} activeDot={{ r: 5, fill: t.primary }} />
                    <Area type="monotone" dataKey="loans" name="Disbursed" stroke={t.accent} strokeWidth={2} fill="url(#gradLoans)" dot={false} activeDot={{ r: 4, fill: t.accent }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: t.textMuted }}>
                    <div style={{ width: 12, height: 3, borderRadius: 99, background: t.primary }} /> Collections
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: t.textMuted }}>
                    <div style={{ width: 12, height: 3, borderRadius: 99, background: t.accent }} /> Disbursed
                  </div>
                </div>
              </div>

              {/* Loan Portfolio Donut */}
              <div style={{
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 20, padding: '20px',
                boxShadow: t.shadow,
              }}>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.text }}>Loan Portfolio</h4>
                  <p style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }}>Status breakdown</p>
                </div>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {pieData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <span style={{ color: t.textMuted }}>{d.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: t.text }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: t.textMuted, fontSize: '0.8rem' }}>
                    <BarChart2 size={32} strokeWidth={1.5} style={{ marginBottom: 8 }} />
                    No loan data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HR Stats (admin only) */}
          {isAdmin && hrStats && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel t={t}>HR Overview</SectionLabel>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <StatCard t={t} label="Total Employees" value={hrStats.totalEmployees ?? 0} icon={Users} />
                <StatCard t={t} label="Present Today"   value={hrStats.todayPresent ?? 0}   icon={CalendarDays} iconColor={t.active} />
                <StatCard t={t} label="Pending Leaves"  value={hrStats.pendingLeaves ?? 0}  icon={CalendarOff}  iconColor={t.pending} />
              </div>
            </div>
          )}

          {/* Recent Loans */}
          <div style={{ marginBottom: 8 }}>
            <SectionLabel
              t={t}
              action={
                <button
                  onClick={() => onNavigate('loans')}
                  style={{
                    fontSize: '0.75rem', color: t.primary,
                    fontWeight: 700, background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'Poppins',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  View all <ArrowRight size={13} />
                </button>
              }
            >
              Recent Loans
            </SectionLabel>

            <div className="flex flex-col gap-2.5">
              {recentLoans.length === 0 ? (
                <div
                  className="rounded-2xl p-6 flex flex-col items-center gap-2"
                  style={{ background: t.card, border: `1px solid ${t.border}` }}
                >
                  <CreditCard size={28} color={t.textMuted} strokeWidth={1.5} />
                  <span style={{ fontSize: '0.82rem', color: t.textMuted }}>No recent loans found.</span>
                </div>
              ) : (
                recentLoans.map(loan => (
                  <RecentLoanCard key={loan._id} t={t} loan={loan} />
                ))
              )}
            </div>
          </div>

          {/* Overdue alert banner */}
          {overdueCount > 0 && (
            <div
              className="flex items-center gap-3 rounded-2xl p-4 mt-4"
              style={{
                background: `${t.overdue}0C`,
                border: `1.5px solid ${t.overdue}30`,
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ width: 40, height: 40, background: `${t.overdue}18`, border: `1px solid ${t.overdue}30` }}
              >
                <AlertCircle size={20} color={t.overdue} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: t.overdue }}>
                  {overdueCount} Overdue Loan{overdueCount > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>
                  Follow up with customers immediately to collect outstanding payments.
                </div>
              </div>
              <button
                onClick={() => onNavigate('loans')}
                style={{
                  fontSize: '0.75rem', color: t.overdue, fontWeight: 700,
                  background: 'none', border: `1.5px solid ${t.overdue}44`,
                  borderRadius: 9, cursor: 'pointer', flexShrink: 0,
                  padding: '6px 14px', fontFamily: 'Poppins',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                View <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
