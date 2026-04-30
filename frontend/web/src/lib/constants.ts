export const APP_NAME = 'JobSwipe';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
export const MAX_SWIPES_PER_DAY = 50;

// ─── Message status config ────────────────────────────────────────────────────
export const USER_STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  interview: { label: 'Interview', color: '#4F9DFF', bg: 'rgba(79,157,255,0.1)',  border: 'rgba(79,157,255,0.25)' },
  reviewing: { label: 'Reviewing', color: '#FFB347', bg: 'rgba(255,183,71,0.1)',  border: 'rgba(255,183,71,0.25)' },
  offer:     { label: 'Offer',     color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)' },
  closed:    { label: 'Closed',    color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
};

export const COMPANY_STATUS_CONFIG = {
  invited:      { label: 'Invited',      color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
  interviewing: { label: 'Interviewing', color: '#4F9DFF', bg: 'rgba(79,157,255,0.1)',  border: 'rgba(79,157,255,0.25)' },
  reviewing:    { label: 'Reviewing',    color: '#FFB347', bg: 'rgba(255,183,71,0.1)',  border: 'rgba(255,183,71,0.25)' },
  offer:        { label: 'Offer Sent',   color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  passed:       { label: 'Passed',       color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
};

// ─── Star labels ──────────────────────────────────────────────────────────────
export const USER_STAR_LABELS: Record<number, string> = {
  1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent',
};

export const COMPANY_STAR_LABELS: Record<number, string> = {
  1: 'Poor fit', 2: 'Below average', 3: 'Good candidate', 4: 'Strong fit', 5: 'Exceptional',
};

// ─── Nav routes ───────────────────────────────────────────────────────────────
export const USER_NAV_ROUTES = {
  home:     '/user/swipe',
  messages: '/user/messages',
  profile:  '/user/profile',
};

export const COMPANY_NAV_ROUTES = {
  home:       '/company/swipe',
  candidates: '/company/candidates',
  postings:   '/company/postings',
  messages:   '/company/messages',
  analytics:  '/company/analytics',
};