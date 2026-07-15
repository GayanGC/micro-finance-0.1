import { Home, CreditCard, HandCoins, Users, BarChart2, UserCheck, CalendarDays, CalendarOff, BookOpen, DollarSign, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Home',      Icon: Home },
  { key: 'loans',       label: 'Loans',     Icon: CreditCard },
  { key: 'collection',  label: 'Collect',   Icon: HandCoins },
  { key: 'customers',   label: 'Customers', Icon: Users },
  { key: 'reports',     label: 'Reports',   Icon: BarChart2 },
  { key: 'employees',   label: 'Employees', Icon: UserCheck },
  { key: 'attendance',  label: 'Attend.',   Icon: CalendarDays },
  { key: 'leave',       label: 'Leave',     Icon: CalendarOff },
  { key: 'policies',    label: 'Policies',  Icon: BookOpen },
  { key: 'salaries',    label: 'Salaries',  Icon: DollarSign },
  { key: 'support',     label: 'Support',   Icon: HelpCircle },
];

// BottomNav — fixed mobile tab bar (< 1024px) — horizontally scrollable
export default function BottomNav({ t, current, onNavigate }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0"
      style={{
        background: t.card,
        borderTop: `1px solid ${t.border}`,
        zIndex: 100,
        height: 68,
        boxShadow: t.mode === 'dark'
          ? '0 -4px 24px rgba(0,0,0,0.4)'
          : '0 -4px 20px rgba(14,92,82,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Scrollable inner container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = current === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="btn-press"
              style={{
                flexShrink: 0,
                minWidth: 64,
                maxWidth: 80,
                flex: '1 0 64px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                paddingBottom: 6,
                paddingTop: 6,
                position: 'relative',
              }}
            >
              {/* Active top indicator */}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 3,
                    borderRadius: '0 0 4px 4px',
                    background: t.primary,
                    boxShadow: `0 2px 6px ${t.primary}66`,
                  }}
                />
              )}

              {/* Icon container */}
              <div
                style={{
                  width: 36,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  background: active ? t.primarySoft : 'transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <Icon
                  size={17}
                  color={active ? t.primary : t.textMuted}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? t.primary : t.textMuted,
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
