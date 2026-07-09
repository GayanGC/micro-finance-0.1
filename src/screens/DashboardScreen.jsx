import { CreditCard, HandCoins, BarChart2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';

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
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
    >
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
        {loan.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loan.customerName}
        </div>
        <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>
          {loan.type} · {loan.area}
        </div>
      </div>

      {/* Amount + stamp */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
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
        <Stamp t={t} status={loan.status} />
      </div>
    </div>
  );
}

export default function DashboardScreen({ t, loans, onNavigate, onToggleTheme, onOpenSettings }) {
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'Active').length;
  const overdueCount = loans.filter(l => l.status === 'Overdue').length;
  const todayTotal = loans.filter(l => l.status === 'Active').reduce((s, l) => s + Math.round(l.balance * 0.05), 0);
  const recentLoans = [...loans].reverse().slice(0, 5);

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
        className="flex-1 px-4 pb-24 lg:pb-8"
        style={{ overflowY: 'auto', paddingTop: 20 }}
      >
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
          <StatCard t={t} label="Today's Collections" value={todayTotal} icon={HandCoins} isAmount accent />
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
            {recentLoans.map(loan => (
              <RecentLoanCard key={loan.id} t={t} loan={loan} />
            ))}
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
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
