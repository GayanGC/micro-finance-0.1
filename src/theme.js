// ─── Design System: MicroFinance Executive Theme v3 ───────────────────────────
// Premium color tokens for Light and Dark modes with glassmorphism & gradients.

export const LIGHT = {
  mode: 'light',

  // Backgrounds
  bg:           '#F8FAFC',
  bgSubtle:     '#F1F5F9',
  bgDeep:       '#E2E8F0',
  card:         '#FFFFFF',
  cardHover:    '#F8FAFC',
  border:       '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Text
  text:      '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',

  // Primary — Executive Blue
  primary:      '#2563EB',
  onPrimary:    '#FFFFFF',
  primarySoft:  'rgba(37, 99, 235, 0.08)',
  primaryMid:   'rgba(37, 99, 235, 0.18)',
  primaryHover: '#1D4ED8',

  // Accent — Amber / Gold
  accent:     '#D97706',
  accentSoft: 'rgba(217, 119, 6, 0.08)',
  accentMid:  'rgba(217, 119, 6, 0.18)',

  // Success
  success:     '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.08)',

  // Info
  info:     '#06B6D4',
  infoSoft: 'rgba(6, 182, 212, 0.08)',

  // Status colors
  active:      '#10B981',
  activeSoft:  'rgba(16, 185, 129, 0.08)',
  overdue:     '#EF4444',
  overdueSoft: 'rgba(239, 68, 68, 0.08)',
  paid:        '#10B981',
  pending:     '#F59E0B',
  pendingSoft: 'rgba(245, 158, 11, 0.08)',

  // Semantic
  danger:      '#EF4444',
  dangerSoft:  'rgba(239, 68, 68, 0.08)',
  warning:     '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.08)',

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  gradientAccent:  'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
  gradientSuccess: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  gradientDanger:  'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
  gradientCard:    'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
  gradientBg:      'linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 100%)',
  gradientHero:    'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)',

  // Glass effect
  glass:       'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  glassShadow: '0 10px 30px rgba(37, 99, 235, 0.08)',

  // Scrollbar
  scrollThumb: '#CBD5E1',

  // Chart colors
  chart: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],

  // Shadows
  shadow:   '0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.03)',
  shadowMd: '0 4px 20px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowLg: '0 12px 36px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)',
  shadowPrimary: '0 4px 20px rgba(37, 99, 235, 0.22)',
};

export const DARK = {
  mode: 'dark',

  // Backgrounds
  bg:           '#0B0F19',
  bgSubtle:     '#111827',
  bgDeep:       '#070A12',
  card:         '#1F2937',
  cardHover:    '#283548',
  border:       '#374151',
  borderStrong: '#4B5563',

  // Text
  text:      '#F9FAFB',
  textMuted: '#9CA3AF',
  textLight: '#6B7280',

  // Primary — Electric Blue
  primary:      '#3B82F6',
  onPrimary:    '#0B0F19',
  primarySoft:  'rgba(59, 130, 246, 0.14)',
  primaryMid:   'rgba(59, 130, 246, 0.25)',
  primaryHover: '#60A5FA',

  // Accent — Gold
  accent:     '#F59E0B',
  accentSoft: 'rgba(245, 158, 11, 0.14)',
  accentMid:  'rgba(245, 158, 11, 0.25)',

  // Success
  success:     '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.14)',

  // Info
  info:     '#06B6D4',
  infoSoft: 'rgba(6, 182, 212, 0.14)',

  // Status colors
  active:      '#10B981',
  activeSoft:  'rgba(16, 185, 129, 0.14)',
  overdue:     '#F87171',
  overdueSoft: 'rgba(248, 113, 113, 0.14)',
  paid:        '#10B981',
  pending:     '#F59E0B',
  pendingSoft: 'rgba(245, 158, 11, 0.14)',

  // Semantic
  danger:      '#F87171',
  dangerSoft:  'rgba(248, 113, 113, 0.14)',
  warning:     '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.14)',

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
  gradientAccent:  'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
  gradientSuccess: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  gradientDanger:  'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
  gradientCard:    'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
  gradientBg:      'linear-gradient(160deg, #0B0F19 0%, #111827 100%)',
  gradientHero:    'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(16, 185, 129, 0.08) 100%)',

  // Glass effect
  glass:       'rgba(31, 41, 55, 0.85)',
  glassBorder: 'rgba(75, 85, 99, 0.5)',
  glassShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',

  // Scrollbar
  scrollThumb: '#374151',

  // Chart colors
  chart: ['#3B82F6', '#10B981', '#F59E0B', '#F87171', '#A78BFA', '#06B6D4'],

  // Shadows
  shadow:   '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
  shadowMd: '0 4px 20px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
  shadowLg: '0 12px 36px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
  shadowPrimary: '0 4px 20px rgba(59, 130, 246, 0.35)',
};

// Helper: get status color from theme
export function statusColor(t, status) {
  const key = (status || '').toLowerCase();
  return t[key] || t.textMuted;
}

// Sri Lankan Rupee formatter
export function formatRs(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString('en-LK')}`;
}

// Short number formatter (1200 → 1.2K)
export function formatShort(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}
