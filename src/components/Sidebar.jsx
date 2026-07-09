import { Home, CreditCard, HandCoins, Users, BarChart2, Settings, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Home',      Icon: Home },
  { key: 'loans',       label: 'Loans',     Icon: CreditCard },
  { key: 'collection',  label: 'Collect',   Icon: HandCoins },
  { key: 'customers',   label: 'Customers', Icon: Users },
  { key: 'reports',     label: 'Reports',   Icon: BarChart2 },
  { key: 'settings',    label: 'Settings',  Icon: Settings },
];

// Sidebar — fixed desktop nav (≥ 1024px)
export default function Sidebar({ t, current, onNavigate, onToggleTheme }) {
  return (
    <aside
      className="hidden lg:flex flex-col sticky top-0 h-screen flex-shrink-0"
      style={{
        width: 224,
        background: t.card,
        borderRight: `1px solid ${t.border}`,
        zIndex: 40,
        boxShadow: `2px 0 16px ${t.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(14,92,82,0.06)'}`,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5"
        style={{ height: 72, borderBottom: `1px solid ${t.border}` }}
      >
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 40, height: 40, background: t.primary }}
        >
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: t.onPrimary }}>MF</span>
        </div>
        <div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text, lineHeight: 1.2 }}>
            MicroFinance
          </div>
          <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500 }}>
            Passbook Ledger
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = current === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="flex items-center gap-3 rounded-xl btn-press w-full text-left"
              style={{
                padding: '10px 14px',
                background: active ? t.primarySoft : 'transparent',
                border: `1.5px solid ${active ? t.primary + '33' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'background 0.18s, border-color 0.18s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.bgSubtle; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon
                size={18}
                color={active ? t.primary : t.textMuted}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 500,
                color: active ? t.primary : t.text,
              }}>
                {label}
              </span>
              {active && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: t.primary,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme toggle */}
      <div style={{ padding: '12px 12px', borderTop: `1px solid ${t.border}` }} className="px-3">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 rounded-xl btn-press w-full text-left font-sans"
          style={{
            padding: '10px 14px',
            background: 'transparent',
            border: '1.5px solid transparent',
            cursor: 'pointer',
            transition: 'background 0.18s, border-color 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {t.mode === 'light'
            ? <Moon size={18} color={t.textMuted} strokeWidth={1.8} />
            : <Sun size={18} color={t.textMuted} strokeWidth={1.8} />
          }
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: t.text,
          }}>
            {t.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
          {/* Custom Toggle Switch */}
          <div
            style={{
              marginLeft: 'auto',
              width: 32,
              height: 18,
              borderRadius: 99,
              background: t.mode === 'dark' ? t.primary : t.border,
              position: 'relative',
              padding: 2,
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                left: t.mode === 'dark' ? 16 : 2,
                top: 2,
                transition: 'left 0.2s',
              }}
            />
          </div>
        </button>
        <div style={{ marginTop: 12, marginBottom: 4, textAlign: 'center', fontSize: '0.65rem', color: t.textMuted, fontWeight: 500 }}>
          v0.1 — Field Agent Build
        </div>
      </div>
    </aside>
  );
}
