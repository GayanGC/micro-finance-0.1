import { Bell, Sun, Moon, ArrowLeft, Settings2 } from 'lucide-react';

// TopBar — sticky header, premium redesign
export default function TopBar({ t, title, onBack, onToggleTheme, onOpenSettings, notifCount = 0 }) {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        height: 64,
        background: t.card,
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: t.mode === 'dark'
          ? '0 1px 16px rgba(0,0,0,0.3)'
          : '0 1px 12px rgba(14,92,82,0.07)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: back button or logo mark */}
      <div className="flex items-center" style={{ minWidth: 44 }}>
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl btn-press"
            style={{
              width: 40,
              height: 40,
              background: t.primarySoft,
              border: `1.5px solid ${t.primary}30`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.primary + '25'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.primarySoft; }}
          >
            <ArrowLeft size={18} color={t.primary} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            className="flex items-center justify-center rounded-xl lg:hidden"
            style={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${t.primary}, ${t.primary}CC)`,
              boxShadow: `0 3px 10px ${t.primary}44`,
            }}
          >
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>MF</span>
          </div>
        )}
      </div>

      {/* Center: page title */}
      <h1
        className="flex-1 text-center px-3"
        style={{
          fontFamily: 'Poppins',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: t.text,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h1>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1.5" style={{ minWidth: 44, justifyContent: 'flex-end' }}>
        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center rounded-xl btn-press"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.18s ease',
          }}
          aria-label="Notifications"
          onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell size={18} color={t.textMuted} strokeWidth={2} />
          {notifCount > 0 && (
            <span
              className="absolute flex items-center justify-center"
              style={{
                top: 7,
                right: 7,
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: t.overdue,
                color: '#fff',
                fontSize: '0.5rem',
                fontWeight: 700,
                border: `2px solid ${t.card}`,
              }}
            >
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center rounded-xl btn-press"
          style={{
            width: 40,
            height: 40,
            background: t.primarySoft,
            border: `1.5px solid ${t.primary}25`,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          aria-label="Toggle theme"
          onMouseEnter={e => { e.currentTarget.style.background = t.primary + '22'; }}
          onMouseLeave={e => { e.currentTarget.style.background = t.primarySoft; }}
        >
          {t.mode === 'light'
            ? <Moon size={16} color={t.primary} strokeWidth={2} />
            : <Sun size={16} color={t.primary} strokeWidth={2} />
          }
        </button>

        {/* Settings */}
        {!onBack && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-xl btn-press"
            style={{
              width: 40,
              height: 40,
              background: t.accentSoft,
              border: `1.5px solid ${t.accent}25`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              marginLeft: 2,
            }}
            aria-label="Settings"
            onMouseEnter={e => { e.currentTarget.style.background = t.accent + '22'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; }}
          >
            <Settings2 size={16} color={t.accent} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
