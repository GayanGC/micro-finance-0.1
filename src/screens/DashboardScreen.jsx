

import { useState, useEffect, useContext } from 'react';
import { CreditCard, HandCoins, BarChart2, TrendingUp, AlertCircle, UserCheck, CalendarDays, CalendarOff, Users } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';
import { getReportSummary, getLoans, getEmployeeStats } from '../api/client.js';
import { AuthContext } from '../context/AuthContext.jsx';

function QuickAction({ t, icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 btn-press w-full"
      style={{
        background: t.card,
        border: `1.5px solid ${t.border}`,
        cursor: 'pointer',
        minHeight: 96,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}25`;
        e.currentTarget.style.borderColor = color + '55';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 44,
          height: 44,
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}33`,
        }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: t.text,
        textAlign: 'center',
        lineHeight: 1.3,
        wordBreak: 'break-word',
        maxWidth: '100%',
      }}>
        {label}
      </span>
    </button>
  );
}

function SectionLabel({ t, children, action }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 16, borderRadius: 99, background: t.primary, flexShrink: 0 }} />
        <h3 style={{
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.82rem',
          color: t.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
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

  // Capitalize status to match frontend Stamp badge
  const displayStatus = loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Pending';

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl p-3.5"
      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
    >
      {/* Left group */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 42,
            height: 42,
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
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.text, fontFamily: 'Poppins' }} className="truncate">
            {customerName}
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 2 }} className="truncate">
            {loan.type}{area ? ` · ${area}` : ''}
          </div>
        </div>
      </div>

      {/* Right group */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            fontSize: '0.85rem',
            color: t.text,
          }}
        >
          {formatRs(loan.balance)}
        </span>
        <Stamp t={t} status={displayStatus} />
      </div>
    </div>
  );
}

export default function DashboardScreen({ t, onNavigate, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [summary, setSummary] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [hrStats, setHrStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, loansRes, hrRes] = await Promise.all([
        getReportSummary(),
        getLoans(),
        isAdmin ? getEmployeeStats() : Promise.resolve(null),
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (loansRes && loansRes.success) {
        setRecentLoans(loansRes.data.slice(0, 5));
      }
      if (hrRes && hrRes.success) {
        setHrStats(hrRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Dashboard" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="flex-1 px-4 py-6 flex flex-col gap-5" style={{ overflowY: 'auto' }}>
          {/* Greeting skeleton */}
          <div className="animate-pulse rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <div className="h-5 w-40 rounded mb-2" style={{ background: t.bgSubtle }} />
            <div className="h-3 w-56 rounded" style={{ background: t.bgSubtle }} />
          </div>
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse h-28 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
          </div>
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse rounded-2xl border" style={{ background: t.card, borderColor: t.border, minHeight: 96 }} />
            ))}
          </div>
          {/* Loans skeleton */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-16 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
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
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: t.primary,
              color: t.onPrimary,
              border: 'none',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { totalLoans = 0, activeLoans = 0, overdueCount = 0, todayCollections = 0 } = summary || {};

  return (
    <div
      className="flex flex-col min-h-full screen-enter"
      style={{ background: t.bg }}
    >
      <TopBar
        t={t}
        title="Dashboard"
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
      />

      <div
        className="flex-1 pb-24 lg:pb-8"
        style={{ overflowY: 'auto', paddingTop: 20 }}
      >
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col">
          {/* Greeting banner */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: `linear-gradient(135deg, ${t.primary}12 0%, ${t.accent}08 100%)`,
              border: `1px solid ${t.primary}20`,
            }}
          >
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: t.text, lineHeight: 1.25 }}>
              Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Agent'} 👋
            </h2>
            <p style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

        {/* Stat cards — always grid */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel t={t}>Overview</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard t={t} label="Total Loans" value={totalLoans} icon={CreditCard} />
            <StatCard t={t} label="Active Loans" value={activeLoans} icon={TrendingUp} iconColor={t.active} />
            <StatCard t={t} label="Today's Collections" value={todayCollections} icon={HandCoins} isAmount accent />
            <StatCard t={t} label="Overdue Count" value={overdueCount} icon={AlertCircle} iconColor={t.overdue} />
          </div>
        </div>

        {/* Quick Actions — 3 cols mobile / 5 cols desktop */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel t={t}>Quick Actions</SectionLabel>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
            <QuickAction t={t} icon={CreditCard}  label="New Loan"    color={t.primary}  onClick={() => onNavigate('newloan')} />
            <QuickAction t={t} icon={HandCoins}   label="Collections" color={t.accent}   onClick={() => onNavigate('collection')} />
            <QuickAction t={t} icon={BarChart2}   label="Reports"     color={t.active}   onClick={() => onNavigate('reports')} />
            <QuickAction t={t} icon={UserCheck}   label="Employees"   color={'#7C5CBF'}  onClick={() => onNavigate('employees')} />
            <QuickAction t={t} icon={CalendarOff} label="Leave"       color={t.overdue}  onClick={() => onNavigate('leave')} />
          </div>
        </div>

        {/* HR Stats (admin only) */}
        {isAdmin && hrStats && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>HR Overview</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <StatCard t={t} label="Total Employees" value={hrStats.totalEmployees ?? 0} icon={Users} />
              <StatCard t={t} label="Present Today"   value={hrStats.todayPresent   ?? 0} icon={CalendarDays} iconColor={t.active} />
              <StatCard t={t} label="Pending Leaves"  value={hrStats.pendingLeaves  ?? 0} icon={CalendarOff}  iconColor={t.pending} />
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
                  fontSize: '0.75rem',
                  color: t.primary,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Poppins',
                  padding: '2px 0',
                }}
              >
                View all →
              </button>
            }
          >
            Recent Loans
          </SectionLabel>

          <div className="flex flex-col gap-3">
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
              background: `${t.overdue}10`,
              border: `1.5px solid ${t.overdue}33`,
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 36,
                background: `${t.overdue}18`,
                border: `1px solid ${t.overdue}30`,
              }}
            >
              <AlertCircle size={18} color={t.overdue} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: t.overdue }}>
                {overdueCount} Overdue Loan{overdueCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>
                Follow up with customers immediately.
              </div>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              style={{
                fontSize: '0.72rem',
                color: t.overdue,
                fontWeight: 700,
                background: 'none',
                border: `1px solid ${t.overdue}44`,
                borderRadius: 8,
                cursor: 'pointer',
                flexShrink: 0,
                padding: '4px 10px',
                fontFamily: 'Poppins',
              }}
            >
              View →
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
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

