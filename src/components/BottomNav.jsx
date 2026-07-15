import { Home, CreditCard, HandCoins, Users, BarChart2, UserCheck, CalendarDays, CalendarOff, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Home',       Icon: Home },
  { key: 'loans',       label: 'Loans',      Icon: CreditCard },
  { key: 'collection',  label: 'Collect',    Icon: HandCoins },
  { key: 'customers',   label: 'Customers',  Icon: Users },
  { key: 'reports',     label: 'Reports',    Icon: BarChart2 },
  { key: 'employees',   label: 'Employees',  Icon: UserCheck },
  { key: 'attendance',  label: 'Attendance', Icon: CalendarDays },
  { key: 'leave',       label: 'Leave',      Icon: CalendarOff },
  { key: 'policies',    label: 'Policies',   Icon: BookOpen },
];

// BottomNav — fixed mobile tab bar (< 1024px)
export default function BottomNav({ t, current, onNavigate }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 flex items-stretch overflow-x-auto scrollbar-hide"
      style={{
        background: t.card,
        borderTop: `1px solid ${t.border}`,
        zIndex: 100,
        height: 64,
        boxShadow: `0 -2px 16px ${t.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(14,92,82,0.08)'}`,
      }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 btn-press"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              paddingBottom: 4,
              position: 'relative',
            }}
          >
            {/* Active indicator pill */}
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 28,
                  height: 3,
                  borderRadius: '0 0 3px 3px',
                  background: t.primary,
                }}
              />
            )}
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 28,
                background: active ? t.primarySoft : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <Icon
                size={18}
                color={active ? t.primary : t.textMuted}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: active ? 700 : 500,
                color: active ? t.primary : t.textMuted,
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
