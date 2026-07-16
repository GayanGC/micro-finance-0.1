import { Bell, Sun, Moon, ArrowLeft, Settings2, Menu } from 'lucide-react';

/**
 * TopBar — sticky header with optional hamburger for mobile sidebar.
 * Props:
 *   onOpenMobileNav — called when hamburger icon is tapped (mobile only)
 *   onBack          — shows a back arrow instead of hamburger (sub-screens)
 */
export default function TopBar({
  t, title, onBack, onToggleTheme, onOpenSettings,
  onOpenMobileNav, notifCount = 0,
}) {
  const iconBtn = (onClick, children, ariaLabel, accentColor) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center justify-center rounded-xl btn-press"
      style={{
        width: 40, height: 40,
        background: accentColor ? `${accentColor}14` : 'transparent',
        border: accentColor ? `1.5px solid ${accentColor}28` : 'none',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = accentColor ? `${accentColor}22` : t.bgSubtle; }}
      onMouseLeave={e => { e.currentTarget.style.background = accentColor ? `${accentColor}14` : 'transparent'; }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex items-center justify-between px-4 md:px-5 flex-shrink-0"
      style={{
        height: 64,
        background: t.card,
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: t.mode === 'dark'
          ? '0 1px 16px rgba(0,0,0,0.3)'
          : '0 1px 12px rgba(15,22,41,0.06)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        gap: 8,
      }}
    >
      {/* ── Left side ── */}
      <div className="flex items-center gap-2" style={{ minWidth: 40 }}>
        {onBack ? (
          /* Back button for sub-screens */
          iconBtn(onBack,
            <ArrowLeft size={18} color={t.primary} strokeWidth={2.5} />,
            'Go back', t.primary
          )
        ) : (
          <>
            {/* Hamburger — visible on mobile only (lg:hidden) */}
            {onOpenMobileNav && (
              <button
                onClick={onOpenMobileNav}
                aria-label="Open navigation"
                className="flex lg:hidden items-center justify-center rounded-xl btn-press"
                style={{
                  width: 40, height: 40,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Menu size={22} color={t.text} strokeWidth={2} />
              </button>
            )}

            {/* Logo mark — mobile only, when sidebar is hidden */}
            <div
              className="flex lg:hidden items-center justify-center rounded-xl"
              style={{
                width: 34, height: 34,
                background: t.gradientPrimary || `linear-gradient(135deg, ${t.primary}, ${t.primary}CC)`,
                boxShadow: `0 3px 10px ${t.primary}44`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>MF</span>
            </div>
          </>
        )}
      </div>

      {/* ── Center: title ── */}
      <h1
        className="flex-1 text-center px-2"
        style={{
          fontFamily: 'Poppins', fontSize: '1rem',
          fontWeight: 700, color: t.text, letterSpacing: '-0.01em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        {title}
      </h1>

      {/* ── Right: action buttons ── */}
      <div className="flex items-center gap-1" style={{ minWidth: 40, justifyContent: 'flex-end' }}>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center rounded-xl btn-press"
          style={{
            width: 40, height: 40,
            background: 'transparent', border: 'none', cursor: 'pointer',
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
                top: 7, right: 7, width: 15, height: 15,
                borderRadius: '50%', background: t.overdue, color: '#fff',
                fontSize: '0.5rem', fontWeight: 700, border: `2px solid ${t.card}`,
              }}
            >
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        {iconBtn(onToggleTheme,
          t.mode === 'light'
            ? <Moon size={16} color={t.primary} strokeWidth={2} />
            : <Sun  size={16} color={t.primary} strokeWidth={2} />,
          'Toggle theme', t.primary
        )}

        {/* Settings */}
        {!onBack && onOpenSettings && iconBtn(
          onOpenSettings,
          <Settings2 size={16} color={t.accent} strokeWidth={2} />,
          'Settings', t.accent
        )}
      </div>
    </div>
  );
}
