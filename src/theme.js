// ─── Design System: MicroFinance Premium Theme v2 ───────────────────────────
// Extended color tokens for light and dark mode with glass, gradient support.

export const LIGHT = {
  mode: 'light',

  // Backgrounds
  bg:        '#F4F6FB',
  bgSubtle:  '#EAECF5',
  bgDeep:    '#E0E4F0',
  card:      '#FFFFFF',
  cardHover: '#FAFBFF',
  border:    '#E2E6F0',
  borderStrong: '#CDD3E2',

  // Text
  text:      '#0F1629',
  textMuted: '#6B7A9A',
  textLight: '#9BA8C0',

  // Primary — Deep Teal/Blue
  primary:     '#1A56DB',
  onPrimary:   '#FFFFFF',
  primarySoft: '#1A56DB14',
  primaryMid:  '#1A56DB30',
  primaryHover:'#1648C4',

  // Accent — Amber/Gold
  accent:     '#D97706',
  accentSoft: '#D977061A',
  accentMid:  '#D9770630',

  // Success
  success:     '#059669',
  successSoft: '#05966914',

  // Info
  info:     '#0891B2',
  infoSoft: '#0891B214',

  // Status colors
  active:  '#059669',
  activeSoft: '#05966914',
  overdue: '#DC2626',
  overdueSoft: '#DC262614',
  paid:    '#059669',
  pending: '#D97706',
  pendingSoft: '#D9770614',

  // Semantic
  danger:     '#DC2626',
  dangerSoft: '#DC262614',
  warning:    '#F59E0B',
  warningSoft:'#F59E0B14',

  // Gradients
  gradientPrimary:  'linear-gradient(135deg, #1A56DB, #3B82F6)',
  gradientAccent:   'linear-gradient(135deg, #D97706, #FBBF24)',
  gradientSuccess:  'linear-gradient(135deg, #059669, #34D399)',
  gradientDanger:   'linear-gradient(135deg, #DC2626, #F87171)',
  gradientCard:     'linear-gradient(145deg, #FFFFFF, #F8FAFF)',
  gradientBg:       'linear-gradient(160deg, #F4F6FB 0%, #EEF2FF 100%)',
  gradientHero:     'linear-gradient(135deg, #1A56DB08 0%, #7C3AED06 50%, #05966905 100%)',

  // Glass effect
  glass:       'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,255,255,0.5)',
  glassShadow: '0 8px 32px rgba(26,86,219,0.08)',

  // Scrollbar
  scrollThumb: '#C5CCDE',

  // Chart colors
  chart: ['#1A56DB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'],

  // Shadows
  shadow:   '0 1px 8px rgba(15,22,41,0.06), 0 4px 16px rgba(15,22,41,0.04)',
  shadowMd: '0 4px 24px rgba(15,22,41,0.10), 0 1px 4px rgba(15,22,41,0.06)',
  shadowLg: '0 12px 40px rgba(15,22,41,0.14), 0 4px 12px rgba(15,22,41,0.08)',
  shadowPrimary: '0 4px 20px rgba(26,86,219,0.25)',
};

export const DARK = {
  mode: 'dark',

  // Backgrounds
  bg:        '#0A0F1E',
  bgSubtle:  '#0F1628',
  bgDeep:    '#070C18',
  card:      '#141D35',
  cardHover: '#1A2440',
  border:    '#1E2A48',
  borderStrong: '#263356',

  // Text
  text:      '#E8EDFB',
  textMuted: '#7888AB',
  textLight: '#4A5980',

  // Primary — Bright Blue (lighter for dark bg)
  primary:     '#60A5FA',
  onPrimary:   '#030D24',
  primarySoft: '#60A5FA1F',
  primaryMid:  '#60A5FA35',
  primaryHover:'#93C5FD',

  // Accent — Warm Gold
  accent:     '#FBBF24',
  accentSoft: '#FBBF2420',
  accentMid:  '#FBBF2435',

  // Success
  success:     '#34D399',
  successSoft: '#34D3991A',

  // Info
  info:     '#22D3EE',
  infoSoft: '#22D3EE1A',

  // Status colors
  active:  '#34D399',
  activeSoft: '#34D3991A',
  overdue: '#F87171',
  overdueSoft: '#F871711A',
  paid:    '#34D399',
  pending: '#FBBF24',
  pendingSoft: '#FBBF241A',

  // Semantic
  danger:     '#F87171',
  dangerSoft: '#F871711A',
  warning:    '#FCD34D',
  warningSoft:'#FCD34D1A',

  // Gradients
  gradientPrimary:  'linear-gradient(135deg, #1D4ED8, #60A5FA)',
  gradientAccent:   'linear-gradient(135deg, #B45309, #FBBF24)',
  gradientSuccess:  'linear-gradient(135deg, #065F46, #34D399)',
  gradientDanger:   'linear-gradient(135deg, #991B1B, #F87171)',
  gradientCard:     'linear-gradient(145deg, #141D35, #1A2440)',
  gradientBg:       'linear-gradient(160deg, #0A0F1E 0%, #0D1528 100%)',
  gradientHero:     'linear-gradient(135deg, #60A5FA0A 0%, #7C3AED08 50%, #34D3990A 100%)',

  // Glass effect
  glass:       'rgba(20,29,53,0.8)',
  glassBorder: 'rgba(96,165,250,0.15)',
  glassShadow: '0 8px 32px rgba(0,0,0,0.4)',

  // Scrollbar
  scrollThumb: '#1E2A48',

  // Chart colors
  chart: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE'],

  // Shadows
  shadow:   '0 1px 8px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
  shadowLg: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
  shadowPrimary: '0 4px 20px rgba(96,165,250,0.3)',
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
