export const t = {
  bg:           '#FAFAF8',
  card:         '#FFFFFF',
  border:       '#EDE8E3',
  accent:       '#4F7EF7',
  accentSoft:   '#EBF0FF',
  text:         '#1A1A2E',
  textMuted:    '#6B7280',
  success:      '#10B981',
  successSoft:  '#D1FAE5',
  warning:      '#F59E0B',
  warningSoft:  '#FEF3C7',
  danger:       '#EF4444',
  dangerSoft:   '#FEE2E2',
  fontHeading:  "'Playfair Display', serif",
  fontBody:     "'DM Sans', sans-serif",
  radius:       '12px',
  radiusSm:     '8px',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:     '0 4px 12px rgba(0,0,0,0.08)',
}

export const statusBadge = (status) => {
  const map = {
    active:    { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
    trial:     { bg: '#EBF0FF', color: '#1D40AF', label: 'Trial' },
    paused:    { bg: '#F3F4F6', color: '#374151', label: 'Paused' },
    sent:      { bg: '#EBF0FF', color: '#1D40AF', label: 'Sent' },
    opened:    { bg: '#FEF3C7', color: '#92400E', label: 'Opened' },
    clicked:   { bg: '#D1FAE5', color: '#065F46', label: 'Clicked' },
    reviewed:  { bg: '#D1FAE5', color: '#065F46', label: 'Reviewed' },
    google:    { bg: '#EBF0FF', color: '#1D40AF', label: 'Google' },
    sms:       { bg: '#FEF3C7', color: '#92400E', label: 'SMS' },
    email:     { bg: '#EBF0FF', color: '#1D40AD', label: 'Email' },
    both:      { bg: '#EDE8E3', color: '#374151', label: 'SMS + Email' },
  }
  return map[status] || { bg: '#F3F4F6', color: '#374151', label: status }
}
