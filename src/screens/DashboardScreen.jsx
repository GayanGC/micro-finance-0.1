

import { useState, useEffect } from 'react';
import { CreditCard, HandCoins, BarChart2, TrendingUp, AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';
import { getReportSummary, getLoans } from '../api/client.js';

function QuickAction({ t, icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl p-4 btn-press flex-1"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        cursor: 'pointer',
        boxShadow: t.shadow,
        minHeight: 90,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = t.shadowMd; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 44, height: 44, background: `${color}1A` }}
      >
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.text, textAlign: 'center' }}>
        {label}
      </span>
    </button>
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
            background: t.primarySoft,
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
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }} className="truncate">
            {loan.type} · {area}
          </div>
        </div>
      </div>

      {/* Right group */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            fontSize: '0.82rem',
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
  const [summary, setSummary] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, loansRes] = await Promise.all([
        getReportSummary(),
        getLoans()
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (loansRes && loansRes.success) {
        // Slice first 5 loans for recent list
        setRecentLoans(loansRes.data.slice(0, 5));
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
        <div className="flex-1 px-4 py-6 flex flex-col gap-6" style={{ overflowY: 'auto' }}>
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-6 w-32 rounded" style={{ background: t.bgSubtle }} />
            <div className="h-4 w-48 rounded" style={{ background: t.bgSubtle }} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse h-28 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-5 w-24 rounded" style={{ background: t.bgSubtle }} />
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
          {/* Greeting */}
          <div className="mb-5">
            <h2
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '1.25rem',
              color: t.text,
              lineHeight: 1.2,
            }}
          >
            Good {getGreeting()}, Agent 👋
          </h2>
          <p style={{ fontSize: '0.78rem', color: t.textMuted, marginTop: 3 }}>
            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat cards — horizontal scroll on mobile, grid on desktop */}
        <div
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible"
          style={{ marginBottom: 24 }}
        >
          <StatCard t={t} label="Total Loans" value={totalLoans} icon={CreditCard} />
          <StatCard t={t} label="Active Loans" value={activeLoans} icon={TrendingUp} iconColor={t.active} />
          <StatCard t={t} label="Today's Collections" value={todayCollections} icon={HandCoins} isAmount accent />
          <StatCard t={t} label="Overdue Count" value={overdueCount} icon={AlertCircle} iconColor={t.overdue} />
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Quick Actions
          </h3>
          <div className="flex gap-3">
            <QuickAction t={t} icon={CreditCard} label="New Loan" color={t.primary} onClick={() => onNavigate('newloan')} />
            <QuickAction t={t} icon={HandCoins} label="Collect Payment" color={t.accent} onClick={() => onNavigate('collection')} />
            <QuickAction t={t} icon={BarChart2} label="Reports" color={t.active} onClick={() => onNavigate('reports')} />
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3
              style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Recent Loans
            </h3>
            <button
              onClick={() => onNavigate('loans')}
              style={{ fontSize: '0.75rem', color: t.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {recentLoans.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: t.textMuted, textAlign: 'center', padding: '16px 0' }}>
                No recent loans.
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
              background: `${t.overdue}12`,
              border: `1.5px solid ${t.overdue}33`,
            }}
          >
            <AlertCircle size={18} color={t.overdue} strokeWidth={2} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: t.overdue }}>
                {overdueCount} Overdue Loan{overdueCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>
                Follow up with customers immediately.
              </div>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              style={{ marginLeft: 'auto', fontSize: '0.72rem', color: t.overdue, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
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

