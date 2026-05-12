// ─────────────────────────────────────────────────────────────────────────────
// Upranked Design System — Full Token Set
// Target quality: Linear / Stripe / Vercel / Mercor
// Font: Inter only. Icons: Phosphor only. Zero emojis anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// ── Neutral scale (Zinc-flavored — cool, not warm) ────────────────────────────
const n = {
  0:   '#FFFFFF',
  50:  '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
  950: '#09090B',
}

// ── Brand (Indigo) ────────────────────────────────────────────────────────────
const brand = {
  50:  '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#4F46E5',  // primary
  600: '#4338CA',
  700: '#3730A3',
}

// ── Semantic palette ──────────────────────────────────────────────────────────
const semantic = {
  // Success
  successText:   '#15803D',
  successBg:     '#F0FDF4',
  successBorder: '#BBF7D0',
  // Warning
  warningText:   '#B45309',
  warningBg:     '#FFFBEB',
  warningBorder: '#FDE68A',
  // Danger
  dangerText:    '#DC2626',
  dangerBg:      '#FEF2F2',
  dangerBorder:  '#FECACA',
  // Info
  infoText:      '#0369A1',
  infoBg:        '#F0F9FF',
  infoBorder:    '#BAE6FD',
}

export const t = {
  // ── App surfaces ──────────────────────────────────────────────────────────
  bg:           n[50],           // #FAFAFA  — page background
  bgSubtle:     n[100],          // #F4F4F5  — inset / sub-panel background
  card:         n[0],            // #FFFFFF  — card / modal surface
  overlay:      'rgba(0,0,0,0.40)',

  // ── Borders ────────────────────────────────────────────────────────────────
  border:       n[200],          // #E4E4E7  — default border
  borderHover:  n[300],          // #D4D4D8  — hovered border
  borderFocus:  brand[500],      // #4F46E5  — focused input border

  // ── Text ──────────────────────────────────────────────────────────────────
  text:         n[900],          // #18181B  — primary text
  textSecond:   n[700],          // #3F3F46  — secondary text
  textMuted:    n[500],          // #71717A  — muted / placeholder
  textSubtle:   n[400],          // #A1A1AA  — very muted / disabled

  // ── Brand / Accent ────────────────────────────────────────────────────────
  accent:       brand[500],      // #4F46E5
  accentHover:  brand[600],      // #4338CA
  accentSoft:   brand[50],       // #EEF2FF
  accentSubtle: brand[100],      // #E0E7FF
  accentGrad:   `linear-gradient(135deg, ${brand[500]} 0%, ${brand[400]} 100%)`,

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:      semantic.successText,
  successSoft:  semantic.successBg,
  successBorder:semantic.successBorder,
  warning:      semantic.warningText,
  warningSoft:  semantic.warningBg,
  warningBorder:semantic.warningBorder,
  danger:       semantic.dangerText,
  dangerSoft:   semantic.dangerBg,
  dangerBorder: semantic.dangerBorder,

  // ── Sidebar (Linear-style deep dark) ─────────────────────────────────────
  sidebar:         n[950],        // #09090B
  sidebarBorder:   '#1C1C1E',
  sidebarText:     n[500],        // #71717A
  sidebarTextHover:n[300],        // #D4D4D8
  sidebarActive:   n[0],          // #FFFFFF
  sidebarActiveBg: 'rgba(255,255,255,0.08)',
  sidebarHoverBg:  'rgba(255,255,255,0.04)',

  // ── Typography ────────────────────────────────────────────────────────────
  font,
  fontMono: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",

  // Font sizes
  textXs:   '11px',
  textSm:   '12px',
  textBase: '13px',
  textMd:   '14px',
  textLg:   '15px',
  textXl:   '16px',
  text2xl:  '18px',
  text3xl:  '20px',
  text4xl:  '24px',
  text5xl:  '28px',
  text6xl:  '32px',

  // ── Spacing (4px grid) ────────────────────────────────────────────────────
  sp1:  '4px',
  sp2:  '8px',
  sp3:  '12px',
  sp4:  '16px',
  sp5:  '20px',
  sp6:  '24px',
  sp8:  '32px',
  sp10: '40px',
  sp12: '48px',
  sp16: '64px',

  // ── Border Radius ─────────────────────────────────────────────────────────
  radiusXs: '4px',
  radiusSm: '6px',
  radius:   '8px',
  radiusMd: '8px',
  radiusLg: '10px',
  radiusXl: '12px',
  radius2xl:'16px',
  radiusFull: '9999px',

  // ── Shadows ───────────────────────────────────────────────────────────────
  shadowXs: '0 1px 2px rgba(0,0,0,0.04)',
  shadow:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 8px -2px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)',
  shadowLg: '0 12px 24px -6px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.05)',
  shadowXl: '0 24px 48px -12px rgba(0,0,0,0.14), 0 8px 16px -8px rgba(0,0,0,0.06)',
  shadowInset: 'inset 0 1px 2px rgba(0,0,0,0.05)',

  // ── Motion ────────────────────────────────────────────────────────────────
  easing:    'cubic-bezier(0.16, 1, 0.3, 1)',
  easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
  spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  transFast:   '80ms cubic-bezier(0.16, 1, 0.3, 1)',
  transNormal: '140ms cubic-bezier(0.16, 1, 0.3, 1)',
  transSlow:   '200ms cubic-bezier(0.16, 1, 0.3, 1)',
}

// ── Status badge token map ────────────────────────────────────────────────────
export const statusBadge = (status) => {
  const map = {
    active:    { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,  label: 'Active' },
    trial:     { bg: brand[50],           color: brand[700],            border: brand[200],               label: 'Trial' },
    paused:    { bg: n[100],              color: n[600],                border: n[200],                   label: 'Paused' },
    sent:      { bg: brand[50],           color: brand[700],            border: brand[200],               label: 'Sent' },
    opened:    { bg: semantic.warningBg,  color: semantic.warningText,  border: semantic.warningBorder,   label: 'Opened' },
    clicked:   { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,   label: 'Clicked' },
    reviewed:  { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,   label: 'Reviewed' },
    failed:    { bg: semantic.dangerBg,   color: semantic.dangerText,   border: semantic.dangerBorder,    label: 'Failed' },
    google:    { bg: brand[50],           color: brand[700],            border: brand[200],               label: 'Google' },
    direct:    { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,   label: 'Direct' },
    private:   { bg: n[100],              color: n[600],                border: n[200],                   label: 'Private' },
    email:     { bg: brand[50],           color: brand[700],            border: brand[200],               label: 'Email' },
    sms:       { bg: semantic.warningBg,  color: semantic.warningText,  border: semantic.warningBorder,   label: 'SMS' },
    both:      { bg: n[100],              color: n[600],                border: n[200],                   label: 'SMS + Email' },
    '5':       { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,   label: '5 Stars' },
    '4':       { bg: semantic.successBg,  color: semantic.successText,  border: semantic.successBorder,   label: '4 Stars' },
    '3':       { bg: semantic.warningBg,  color: semantic.warningText,  border: semantic.warningBorder,   label: '3 Stars' },
    '2':       { bg: semantic.dangerBg,   color: semantic.dangerText,   border: semantic.dangerBorder,    label: '2 Stars' },
    '1':       { bg: semantic.dangerBg,   color: semantic.dangerText,   border: semantic.dangerBorder,    label: '1 Star' },
  }
  return map[status] || { bg: n[100], color: n[600], border: n[200], label: status }
}
