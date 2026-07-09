// PrimaryButton — filled button with primary theme color
export default function PrimaryButton({ t, children, onClick, fullWidth = false, disabled = false, style = {}, size = 'md', variant = 'filled' }) {
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '0.8rem' },
    md: { padding: '13px 24px', fontSize: '0.9rem' },
    lg: { padding: '16px 32px', fontSize: '1rem' },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '12px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'opacity 0.15s, transform 0.12s, box-shadow 0.15s',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.55 : 1,
    outline: 'none',
    letterSpacing: '0.01em',
    ...sizeStyles[size],
    ...style,
  };

  if (variant === 'filled') {
    return (
      <button
        className="btn-press"
        onClick={!disabled ? onClick : undefined}
        style={{
          ...base,
          background: t.primary,
          color: t.onPrimary,
          boxShadow: `0 2px 12px ${t.primary}44`,
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.55' : '1'; }}
      >
        {children}
      </button>
    );
  }

  // Outlined variant
  return (
    <button
      className="btn-press"
      onClick={!disabled ? onClick : undefined}
      style={{
        ...base,
        background: 'transparent',
        color: t.primary,
        border: `1.5px solid ${t.primary}`,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = t.primarySoft; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
