// ─── Design System: Passbook Ledger Theme ─────────────────────────────────
// All color tokens for light and dark mode.
// Components consume these via the `t` prop (theme object).

export const LIGHT = {
  mode: 'light',

  // Backgrounds
  bg:        '#F6F4EF',
  bgSubtle:  '#EFEBE2',
  card:      '#FFFFFF',
  border:    '#E4DFD3',

  // Text
  text:      '#16231F',
  textMuted: '#6B7A74',

  // Primary — Teal
  primary:     '#0E5C52',
  onPrimary:   '#FFFFFF',
  primarySoft: '#0E5C5214',

  // Accent — Gold
  accent:     '#C7912F',
  accentSoft: '#C7912F1A',

  // Status colors (for Stamp badges)
  active:  '#0E5C52',
  overdue: '#B5433A',
  paid:    '#3E7A4C',
  pending: '#A6791F',

  // Semantic
  danger:  '#B5433A',

  // Scrollbar
  scrollThumb: '#C9C3B5',

  // Chart colors
  chart: ['#0E5C52', '#C7912F', '#B5433A', '#3E7A4C', '#7A5C2F'],

  // Shadow
  shadow: '0 2px 12px rgba(14,92,82,0.08)',
  shadowMd: '0 4px 24px rgba(14,92,82,0.12)',
};

export const DARK = {
  mode: 'dark',

  // Backgrounds
  bg:        '#0E1614',
  bgSubtle:  '#141F1C',
  card:      '#182420',
  border:    '#233330',

  // Text
  text:      '#EDEFE9',
  textMuted: '#8FA39B',

  // Primary — Teal (lighter for dark)
  primary:     '#4FB3A2',
  onPrimary:   '#08211C',
  primarySoft: '#4FB3A21F',

  // Accent — Gold (lighter for dark)
  accent:     '#E3B15C',
  accentSoft: '#E3B15C22',

  // Status colors
  active:  '#4FB3A2',
  overdue: '#E4776C',
  paid:    '#7FCB8F',
  pending: '#E3B15C',

  // Semantic
  danger:  '#E4776C',

  // Scrollbar
  scrollThumb: '#2E4440',

  // Chart colors
  chart: ['#4FB3A2', '#E3B15C', '#E4776C', '#7FCB8F', '#C7A56E'],

  // Shadow
  shadow: '0 2px 12px rgba(0,0,0,0.3)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.45)',
};

// Helper: get status color from theme
export function statusColor(t, status) {
  const key = (status || '').toLowerCase();
  return t[key] || t.textMuted;
}

// Sri Lankan Rupee formatter
export function formatRs(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
}
