import React from 'react';
import { IconBriefcase, IconHeart } from '@/components/ui/icons';
import { USER_NAV_ROUTES } from './constants';

// ─── User nav items ───────────────────────────────────────────────────────────
// Single source of truth for the sidebar nav across all user pages.
// Import USER_NAV and USER_NAV_ROUTES in every page that uses LeftSidebar.

export const USER_NAV = [
  {
    id: 'home',
    label: 'Home',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    id: 'explore',
    label: 'Explore',
    Icon: () => <IconBriefcase />,
  },
  {
    id: 'applications',
    label: 'Applications',
    Icon: () => <IconHeart />,
  },
  {
    id: 'messages',
    label: 'Messages',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export { USER_NAV_ROUTES };