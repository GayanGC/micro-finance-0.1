import { Home, CreditCard, HandCoins, Users, BarChart2, Sun, Moon, CalendarDays, CalendarOff, BookOpen, UserCheck, LogOut } from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Finance',
    items: [
      { key: 'dashboard',   label: 'Dashboard',   Icon: Home },
      { key: 'loans',       label: 'Loans',        Icon: CreditCard },
      { key: 'collection',  label: 'Collections',  Icon: HandCoins },
      { key: 'customers',   label: 'Customers',    Icon: Users },
      { key: 'reports',     label: 'Reports',      Icon: BarChart2 },
    ],
  },
  {
    label: 'HR & People',
    items: [
      { key: 'employees',  label: 'Employees',  Icon: UserCheck },
      { key: 'attendance', label: 'Attendance', Icon: CalendarDays },
      { key: 'leave',      label: 'Leave',      Icon: CalendarOff },
      { key: 'policies',   label: 'Policies',   Icon: BookOpen },
    ],
  },
];

export default function Sidebar({ t, current, onNavigate, onToggleTheme }) {
  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0"
      style={{
        width: 256,
        background: t.card,
        borderRight: `1px solid ${t.border}`,
        zIndex: 40,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: t.mode === 'dark'
          ? '4px 0 24px rgba(0,0,0,0.3)'
          : '4px 0 24px rgba(14,92,82,0.07)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: 72, borderBottom: `1px solid ${t.border}` }}
      >
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            background: `linear-gradient(135deg, ${t.primary}, ${t.primary}BB)`,
            boxShadow: `0 4px 12px ${t.primary}44`,
          }}
        >
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>MF</span>
        </div>
        <div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text, lineHeight: 1.2 }}>
            MicroFinance
          </div>
          <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, marginTop: 1 }}>
            Passbook Ledger
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col overflow-y-auto" style={{ gap: 2 }}>
        {NAV_SECTIONS.map(({ label, items }, sectionIdx) => (
          <div key={label} style={{ marginBottom: 4 }}>
            {/* Section label */}
            {sectionIdx > 0 && (
              <div style={{ margin: '12px 4px 8px', paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: t.textMuted,
                  paddingLeft: 10,
                  opacity: 0.8,
                }}>
                  {label}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(({ key, label: itemLabel, Icon }) => {
                const active = current === key;
                return (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    className="flex items-center gap-3 btn-press w-full text-left"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 12,
                      background: active
                        ? `linear-gradient(135deg, ${t.primary}20, ${t.primary}0D)`
                        : 'transparent',
                      border: `1.5px solid ${active ? t.primary + '40' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = t.bgSubtle;
                        e.currentTarget.style.borderColor = t.border;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {/* Icon container */}
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: active ? t.primary + '20' : t.bgSubtle,
                        transition: 'background 0.18s ease',
                      }}
                    >
                      <Icon
                        size={16}
                        color={active ? t.primary : t.textMuted}
                        strokeWidth={active ? 2.5 : 2}
                      />
                    </div>

                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? t.primary : t.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                    }}>
                      {itemLabel}
                    </span>

                    {active && (
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: t.primary,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${t.primary}88`,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: theme toggle */}
      <div style={{ padding: '10px 12px 16px', borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 btn-press w-full text-left"
          style={{
            padding: '11px 14px',
            borderRadius: 12,
            background: 'transparent',
            border: '1.5px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = t.bgSubtle;
            e.currentTarget.style.borderColor = t.border;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: 9, background: t.bgSubtle }}
          >
            {t.mode === 'light'
              ? <Moon size={16} color={t.textMuted} strokeWidth={2} />
              : <Sun size={16} color={t.textMuted} strokeWidth={2} />
            }
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: t.text, flex: 1, whiteSpace: 'nowrap' }}>
            {t.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>

          {/* Toggle pill */}
          <div style={{
            width: 36,
            height: 20,
            borderRadius: 99,
            background: t.mode === 'dark' ? t.primary : t.border,
            position: 'relative',
            flexShrink: 0,
            transition: 'background 0.25s',
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              left: t.mode === 'dark' ? 18 : 3,
              top: 3,
              transition: 'left 0.25s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </div>
        </button>

        <div style={{
          marginTop: 10,
          textAlign: 'center',
          fontSize: '0.6rem',
          color: t.textMuted,
          fontWeight: 500,
          opacity: 0.7,
        }}>
          v0.1 — MicroFinance Platform
        </div>
      </div>
    </aside>
  );
}
