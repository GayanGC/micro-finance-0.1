import { Bell, Sun, Moon, ArrowLeft, User } from 'lucide-react';

// TopBar — sticky header with back/title/bell/theme-toggle/profile
export default function TopBar({ t, title, onBack, onToggleTheme, onOpenSettings, notifCount = 2 }) {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        height: 60,
        background: t.card,
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: `0 1px 8px ${t.mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(14,92,82,0.06)'}`,
      }}
    >
      {/* Left: back or spacer */}
      <div className="flex items-center" style={{ minWidth: 40 }}>
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl btn-press"
            style={{
              width: 38,
              height: 38,
              background: t.primarySoft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color={t.primary} strokeWidth={2.5} />
          </button>
        ) : (
          /* App logo mark on main screens */
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: t.primary }}
          >
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.85rem', color: t.onPrimary }}>MF</span>
          </div>
        )}
      </div>

      {/* Center: title */}
      <h1
        className="font-display text-center flex-1 truncate px-2"
        style={{
          fontFamily: 'Poppins',
          fontSize: '1rem',
          fontWeight: 700,
          color: t.text,
        }}
      >
        {title}
      </h1>

      {/* Right: actions */}
      <div className="flex items-center gap-1" style={{ minWidth: 80, justifyContent: 'flex-end' }}>
        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center rounded-xl btn-press"
          style={{ width: 38, height: 38, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Notifications"
        >
          <Bell size={18} color={t.textMuted} strokeWidth={2} />
          {notifCount > 0 && (
            <span
              className="absolute flex items-center justify-center"
              style={{
                top: 6,
                right: 6,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: t.overdue,
                color: '#fff',
                fontSize: '0.55rem',
                fontWeight: 700,
              }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center rounded-xl btn-press"
          style={{ width: 38, height: 38, background: t.primarySoft, border: 'none', cursor: 'pointer' }}
          aria-label="Toggle theme"
        >
          {t.mode === 'light'
            ? <Moon size={16} color={t.primary} strokeWidth={2} />
            : <Sun size={16} color={t.primary} strokeWidth={2} />
          }
        </button>

        {/* Profile icon → Settings (only when no back button) */}
        {!onBack && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-xl btn-press"
            style={{ width: 38, height: 38, background: t.accentSoft, border: 'none', cursor: 'pointer', marginLeft: 2 }}
            aria-label="Settings"
          >
            <User size={16} color={t.accent} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
