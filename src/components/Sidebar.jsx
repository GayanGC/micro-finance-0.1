import { useState, useContext } from 'react';
import {
  Home, CreditCard, HandCoins, Users, BarChart2,
  Sun, Moon, CalendarDays, CalendarOff, BookOpen, UserCheck,
  DollarSign, HelpCircle, FileText, ChevronLeft, ChevronRight,
  LogOut, Settings2, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

const NAV_SECTIONS = [
  {
    label: 'Finance',
    items: [
      { key: 'dashboard',   label: 'Dashboard',    Icon: Home },
      { key: 'loans',       label: 'Loans',         Icon: CreditCard },
      { key: 'collection',  label: 'Collections',   Icon: HandCoins },
      { key: 'customers',   label: 'Customers',     Icon: Users },
      { key: 'reports',     label: 'Reports',       Icon: BarChart2 },
    ],
  },
  {
    label: 'HR & People',
    items: [
      { key: 'employees',  label: 'Employees',   Icon: UserCheck },
      { key: 'attendance', label: 'Attendance',  Icon: CalendarDays },
      { key: 'leave',      label: 'Leave',       Icon: CalendarOff },
      { key: 'policies',   label: 'Policies',    Icon: BookOpen },
      { key: 'salaries',   label: 'Salaries',    Icon: DollarSign },
      { key: 'etfepf',     label: 'ETF / EPF',   Icon: FileText },
      { key: 'support',    label: 'Support Q&A', Icon: HelpCircle },
    ],
  },
];

export default function Sidebar({ t, current, onNavigate, onToggleTheme, variant = 'desktop', onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const isMobile = variant === 'mobile';
  // Mobile drawer is never collapsed
  const isCollapsed = !isMobile && collapsed;

  const handleNav = (key) => {
    onNavigate(key);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={isMobile ? "flex flex-col h-full w-full theme-transition" : "hidden lg:flex flex-col flex-shrink-0 theme-transition"}
      style={{
        width: isMobile ? '100%' : (isCollapsed ? 72 : 256),
        background: t.card,
        borderRight: isMobile ? 'none' : `1px solid ${t.border}`,
        zIndex: isMobile ? 210 : 40,
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 0 : 0,
        height: '100vh',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: !isMobile && t.mode === 'dark'
          ? '4px 0 32px rgba(0,0,0,0.35)'
          : (!isMobile ? '4px 0 24px rgba(15,22,41,0.07)' : 'none'),
        overflow: 'hidden',
      }}
    >
      {/* Logo + Collapse toggle / Close button */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          height: 72,
          borderBottom: `1px solid ${t.border}`,
          padding: isCollapsed ? '0 16px' : '0 16px 0 20px',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 40,
              height: 40,
              background: t.gradientPrimary || `linear-gradient(135deg, ${t.primary}, ${t.primary}BB)`,
              boxShadow: `0 4px 14px ${t.primary}44`,
            }}
          >
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>MF</span>
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                MicroFinance
              </div>
              <div style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 500, marginTop: 1, whiteSpace: 'nowrap' }}>
                Passbook Ledger
              </div>
            </div>
          )}
        </div>

        {/* Action button: Collapse toggle for desktop, Close button for mobile */}
        {isMobile ? (
          <button
            onClick={onClose}
            className="flex items-center justify-center btn-press"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: t.bgSubtle, border: `1px solid ${t.border}`,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={16} color={t.textMuted} />
          </button>
        ) : (
          !isCollapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center btn-press"
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} color={t.textMuted} />
            </button>
          )
        )}
      </div>

      {/* Expand button (when collapsed on desktop) */}
      {!isMobile && isCollapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-center btn-press mx-auto mt-3"
          style={{
            width: 40, height: 32, borderRadius: 8,
            background: t.bgSubtle, border: `1px solid ${t.border}`,
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={14} color={t.textMuted} />
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 flex flex-col overflow-y-auto" style={{ gap: 2 }}>
        {NAV_SECTIONS.map(({ label, items }, sectionIdx) => (
          <div key={label} style={{ marginBottom: 4 }}>
            {/* Section label */}
            {sectionIdx > 0 && !isCollapsed && (
              <div style={{ margin: '10px 6px 6px', paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: t.textMuted, paddingLeft: 10, opacity: 0.75,
                }}>
                  {label}
                </span>
              </div>
            )}
            {sectionIdx > 0 && isCollapsed && (
              <div style={{ height: 1, background: t.border, margin: '10px 12px' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(({ key, label: itemLabel, Icon }) => {
                const active = current === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNav(key)}
                    title={isCollapsed ? itemLabel : ''}
                    className="flex items-center btn-press w-full text-left"
                    style={{
                      padding: isCollapsed ? '10px 0' : '10px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      gap: 10,
                      borderRadius: 11,
                      background: active
                        ? `linear-gradient(135deg, ${t.primary}18, ${t.primary}0A)`
                        : 'transparent',
                      border: `1.5px solid ${active ? t.primary + '35' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
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
                    {/* Active indicator bar */}
                    {active && !isCollapsed && (
                      <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: 99,
                        background: t.primary,
                      }} />
                    )}

                    {/* Icon container */}
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: active ? `${t.primary}18` : t.bgSubtle,
                        transition: 'background 0.18s ease',
                      }}
                    >
                      <Icon
                        size={16}
                        color={active ? t.primary : t.textMuted}
                        strokeWidth={active ? 2.5 : 1.8}
                      />
                    </div>

                    {/* Label */}
                    {!isCollapsed && (
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? t.primary : t.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        fontFamily: active ? 'Poppins' : 'Inter',
                      }}>
                        {itemLabel}
                      </span>
                    )}

                    {/* Active dot */}
                    {active && !isCollapsed && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: t.primary, flexShrink: 0,
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

      {/* Bottom section: user profile + theme toggle */}
      <div style={{ padding: '10px 10px 14px', borderTop: `1px solid ${t.border}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* User info */}
        {!isCollapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: t.bgSubtle, border: `1px solid ${t.border}`,
            marginBottom: 4,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: t.gradientPrimary || `linear-gradient(135deg, ${t.primary}, ${t.primary}BB)`,
              display: 'flex', alignItems: 'center', justifyItems: 'center',
              justifyContent: 'center', alignContent: 'center',
              flexShrink: 0, fontFamily: 'Poppins', fontWeight: 700,
              fontSize: '0.8rem', color: '#fff',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 500 }}>
                {user.role === 'admin' ? 'Administrator' : 'Field Agent'}
              </div>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 btn-press w-full text-left"
          title={isCollapsed ? (t.mode === 'light' ? 'Dark Mode' : 'Light Mode') : ''}
          style={{
            padding: isCollapsed ? '10px 0' : '10px 12px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderRadius: 11, background: 'transparent',
            border: '1.5px solid transparent', cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle; e.currentTarget.style.borderColor = t.border; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 9, background: t.bgSubtle }}>
            {t.mode === 'light'
              ? <Moon size={16} color={t.textMuted} strokeWidth={2} />
              : <Sun size={16} color={t.textMuted} strokeWidth={2} />
            }
          </div>
          {!isCollapsed && (
            <>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: t.text, flex: 1, whiteSpace: 'nowrap' }}>
                {t.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
              {/* Toggle pill */}
              <div style={{
                width: 36, height: 20, borderRadius: 99,
                background: t.mode === 'dark' ? t.primary : t.border,
                position: 'relative', flexShrink: 0, transition: 'background 0.25s',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  position: 'absolute',
                  left: t.mode === 'dark' ? 18 : 3, top: 3, transition: 'left 0.25s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </>
          )}
        </button>

        {/* Version */}
        {!isCollapsed && (
          <div style={{ textAlign: 'center', fontSize: '0.58rem', color: t.textMuted, fontWeight: 500, opacity: 0.6, marginTop: 4 }}>
            v0.2 — MicroFinance Platform
          </div>
        )}
      </div>
    </aside>
  );
}
