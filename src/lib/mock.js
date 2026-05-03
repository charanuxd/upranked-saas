// Realistic seed data — used when Supabase is not yet configured

export const MOCK_ADMIN = { id: 'admin-1', role: 'admin', full_name: 'Charan', email: 'admin@upranked.co' }

export const MOCK_CLIENTS = [
  {
    id: 'client-1', profile_id: 'profile-1',
    business_name: 'Metro HVAC & Plumbing', owner_name: 'James Mitchell',
    owner_email: 'james@metrohvac.com', owner_phone: '(512) 555-0182',
    google_profile_url: 'https://g.page/metrohvac', review_slug: 'metro-hvac',
    current_rating: 4.8, status: 'active', plan: 'active',
    internal_notes: 'Great client — very responsive. Referred by Harbor Roofing.',
    created_at: '2024-11-01T10:00:00Z',
  },
  {
    id: 'client-2', profile_id: 'profile-2',
    business_name: 'Sunrise Comfort Systems', owner_name: 'Sarah Chen',
    owner_email: 'sarah@sunrisecomfort.com', owner_phone: '(737) 555-0294',
    google_profile_url: 'https://g.page/sunrisecomfort', review_slug: 'sunrise-comfort',
    current_rating: 4.7, status: 'active', plan: 'active',
    internal_notes: 'Onboarded Feb 2025. Very happy with results so far.',
    created_at: '2025-02-03T09:00:00Z',
  },
]

export const MOCK_RATINGS = {
  'client-1': [
    { month: 'Nov', rating: 4.1 }, { month: 'Dec', rating: 4.3 },
    { month: 'Jan', rating: 4.4 }, { month: 'Feb', rating: 4.5 },
    { month: 'Mar', rating: 4.7 }, { month: 'Apr', rating: 4.8 },
  ],
  'client-2': [
    { month: 'Nov', rating: 3.8 }, { month: 'Dec', rating: 4.0 },
    { month: 'Jan', rating: 4.2 }, { month: 'Feb', rating: 4.4 },
    { month: 'Mar', rating: 4.6 }, { month: 'Apr', rating: 4.7 },
  ],
}

const reviewNames = [
  'Maria R.', 'Tom B.', 'Anita S.', 'James P.', 'Chris N.', 'Lisa M.',
  'David K.', 'Emma L.', 'Ryan T.', 'Jessica W.', 'Mark C.', 'Angela D.',
  'Steve H.', 'Monica F.', 'Brian O.',
]
const reviewTexts5 = [
  'Absolutely fantastic service. Showed up on time, fixed the issue quickly, and left everything spotless.',
  'Best HVAC company in town. Tech was professional, knowledgeable, and got our AC running perfectly.',
  'Called them on a Friday afternoon and they had someone out by morning. Incredible response time.',
  'Fair pricing, great work, and they explained everything clearly. Highly recommend to anyone.',
  'Installed our new system in one day. The team was clean, efficient, and respectful of our home.',
]
const reviewTexts4 = [
  'Good experience overall. Work was done properly and the technician was friendly.',
  'Solid company. Took a bit longer than expected but the result was great.',
  'Happy with the service. Would have liked a follow-up call but everything works perfectly.',
  'Professional and knowledgeable. Pricing was fair for the quality of work.',
]
const dates = ['Apr 28', 'Apr 21', 'Apr 14', 'Apr 9', 'Mar 30', 'Mar 22', 'Mar 15', 'Mar 8', 'Feb 28', 'Feb 20', 'Feb 13', 'Feb 5', 'Jan 29', 'Jan 22', 'Jan 15']

export const MOCK_REVIEWS = {
  'client-1': reviewNames.map((name, i) => ({
    id: `r1-${i}`, client_id: 'client-1',
    reviewer_name: name,
    star_rating: i < 11 ? 5 : 4,
    review_text: i < 11 ? reviewTexts5[i % 5] : reviewTexts4[i % 4],
    source: 'google', review_date: dates[i], is_private: false,
    created_at: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  'client-2': reviewNames.map((name, i) => ({
    id: `r2-${i}`, client_id: 'client-2',
    reviewer_name: name,
    star_rating: i < 10 ? 5 : 4,
    review_text: i < 10 ? reviewTexts5[i % 5] : reviewTexts4[i % 4],
    source: 'google', review_date: dates[i], is_private: false,
    created_at: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
  })),
}

const reqNames = ['John D.', 'Patricia S.', 'Michael T.', 'Jennifer A.', 'Robert L.', 'Linda M.', 'William F.', 'Barbara K.', 'Richard B.', 'Susan C.']
const channels = ['sms', 'email', 'both', 'sms', 'email', 'both', 'sms', 'email', 'both', 'sms']
const statuses = ['reviewed', 'clicked', 'opened', 'sent', 'reviewed', 'clicked', 'sent', 'reviewed', 'opened', 'sent']

export const MOCK_REQUESTS = {
  'client-1': Array.from({ length: 20 }, (_, i) => ({
    id: `req1-${i}`, client_id: 'client-1',
    customer_name: reqNames[i % 10],
    customer_phone: `(512) 555-0${String(i + 100).slice(-3)}`,
    customer_email: `customer${i + 1}@example.com`,
    channel: channels[i % 10],
    status: statuses[i % 10],
    sent_at: new Date(Date.now() - i * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  'client-2': Array.from({ length: 20 }, (_, i) => ({
    id: `req2-${i}`, client_id: 'client-2',
    customer_name: reqNames[i % 10],
    customer_phone: `(737) 555-0${String(i + 100).slice(-3)}`,
    customer_email: `customer${i + 1}@example.com`,
    channel: channels[(i + 2) % 10],
    status: statuses[(i + 3) % 10],
    sent_at: new Date(Date.now() - i * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  })),
}

export const MOCK_ACTIVITY = {
  'client-1': [
    { id: 'a1', type: 'review_received', description: 'New 5-star review from Maria R.', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'a2', type: 'request_sent', description: 'Review request sent to John D. via SMS', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'a3', type: 'review_received', description: 'New 5-star review from Tom B.', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'a4', type: 'request_sent', description: 'Review request sent to Patricia S. via Email', created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
    { id: 'a5', type: 'report_generated', description: 'Monthly report for April generated', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'a6', type: 'review_received', description: 'New 5-star review from Anita S.', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'a7', type: 'note', description: 'Campaign activated for spring season', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  'client-2': [
    { id: 'b1', type: 'review_received', description: 'New 5-star review from Chris N.', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'b2', type: 'request_sent', description: 'Review request sent to Michael T. via SMS', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    { id: 'b3', type: 'report_generated', description: 'Monthly report for April generated', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'b4', type: 'review_received', description: 'New 4-star review from Lisa M.', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ],
}

export const MOCK_REPORTS = {
  'client-1': [
    { id: 'rp1', client_id: 'client-1', month: 4, year: 2025, reviews_gained: 12, rating_start: 4.7, rating_end: 4.8, requests_sent: 30, response_rate: 40, generated_at: '2025-05-01T08:00:00Z' },
    { id: 'rp2', client_id: 'client-1', month: 3, year: 2025, reviews_gained: 9, rating_start: 4.5, rating_end: 4.7, requests_sent: 28, response_rate: 32, generated_at: '2025-04-01T08:00:00Z' },
    { id: 'rp3', client_id: 'client-1', month: 2, year: 2025, reviews_gained: 7, rating_start: 4.4, rating_end: 4.5, requests_sent: 25, response_rate: 28, generated_at: '2025-03-01T08:00:00Z' },
  ],
  'client-2': [
    { id: 'rp4', client_id: 'client-2', month: 4, year: 2025, reviews_gained: 10, rating_start: 4.6, rating_end: 4.7, requests_sent: 27, response_rate: 37, generated_at: '2025-05-01T08:00:00Z' },
    { id: 'rp5', client_id: 'client-2', month: 3, year: 2025, reviews_gained: 8, rating_start: 4.4, rating_end: 4.6, requests_sent: 24, response_rate: 33, generated_at: '2025-04-01T08:00:00Z' },
  ],
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
