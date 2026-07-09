import { formatRs } from '../theme.js';

// StatCard — compact card for dashboard stats
export default function StatCard({ t, label, value, subtext, icon: Icon, iconColor, isAmount = false, accent = false }) {
  const color = iconColor || (accent ? t.accent : t.primary);
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-2 flex-shrink-0"
      style={{
        background: t.card,
        borderColor: t.border,
        boxShadow: t.shadow,
        minWidth: 140,
      }}
    >
      {/* Icon tile */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}1A`,
        }}
      >
        <Icon size={18} color={color} strokeWidth={2} />
      </div>

      {/* Value */}
      <div
        className="font-mono leading-tight"
        style={{
          fontSize: isAmount ? '1rem' : '1.35rem',
          fontWeight: 600,
          color: t.text,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {isAmount ? formatRs(value) : value}
      </div>

      {/* Label */}
      <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, lineHeight: 1.3 }}>
        {label}
      </div>

      {/* Subtext */}
      {subtext && (
        <div style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
