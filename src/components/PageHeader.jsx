import { ChevronRight } from 'lucide-react';

/**
 * PageHeader — consistent page-level header with title, subtitle, breadcrumb, and action slot.
 * Usage:
 *   <PageHeader t={t} title="ETF / EPF" subtitle="Contribution management" action={<button>...</button>} />
 */
export default function PageHeader({ t, title, subtitle, breadcrumb, action, icon: Icon, iconColor }) {
  const color = iconColor || t.primary;
  return (
    <div
      className="flex items-start justify-between gap-4 mb-6"
      style={{
        padding: '24px 0 0 0',
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${color}20, ${color}0D)`,
              border: `1.5px solid ${color}30`,
            }}
          >
            <Icon size={24} color={color} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <div
              className="flex items-center gap-1 mb-1"
              style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 500 }}
            >
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={11} />}
                  <span style={{ color: i === breadcrumb.length - 1 ? t.primary : t.textMuted }}>
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'Poppins',
              fontWeight: 800,
              fontSize: '1.45rem',
              color: t.text,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.8rem',
                color: t.textMuted,
                marginTop: 4,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
