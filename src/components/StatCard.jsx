import { formatRs } from '../theme.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

// StatCard — premium dashboard stat card with gradient accent
export default function StatCard({ t, label, value, subtext, trend, icon: Icon, iconColor, isAmount = false, accent = false }) {
  const color = iconColor || (accent ? t.accent : t.primary);

  return (
    <div
      className="rounded-2xl flex flex-col gap-3 flex-shrink-0"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        minWidth: 140,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = t.shadowMd;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = t.shadow;
      }}
    >
      {/* Top colored bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}55)`,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Icon + trend row */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            border: `1px solid ${color}25`,
          }}
        >
          <Icon size={20} color={color} strokeWidth={2} />
        </div>

        {trend != null && (
          <div className="flex items-center gap-1" style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: trend >= 0 ? t.active : t.danger,
          }}>
            {trend >= 0
              ? <TrendingUp size={13} strokeWidth={2.5} />
              : <TrendingDown size={13} strokeWidth={2.5} />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontSize: isAmount ? '1.05rem' : '1.5rem',
            fontWeight: 700,
            color: t.text,
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: 1.1,
            letterSpacing: isAmount ? '-0.02em' : '-0.03em',
          }}
        >
          {isAmount ? formatRs(value) : value}
        </div>

        {/* Label */}
        <div style={{
          fontSize: '0.73rem',
          color: t.textMuted,
          fontWeight: 500,
          marginTop: 4,
          lineHeight: 1.3,
        }}>
          {label}
        </div>

        {/* Subtext */}
        {subtext && (
          <div style={{ fontSize: '0.65rem', color, fontWeight: 600, marginTop: 3 }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
