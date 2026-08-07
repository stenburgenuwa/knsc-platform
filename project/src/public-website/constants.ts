// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Pagination
export const DEFAULT_PAGE_LIMIT = 20;
export const FIXTURES_PAGE_LIMIT = 12;
export const RESULTS_PAGE_LIMIT = 12;
export const PLAYERS_PAGE_LIMIT = 16;
export const NEWS_PAGE_LIMIT = 10;

// Cache TTL (milliseconds)
export const CACHE_TTL = {
  STANDINGS: 5 * 60 * 1000,
  FIXTURES: 5 * 60 * 1000,
  RESULTS: 10 * 60 * 1000,
  CLUBS: 30 * 60 * 1000,
  PLAYERS: 30 * 60 * 1000,
  NEWS: 10 * 60 * 1000,
};

// Image optimization
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  CARD: { width: 300, height: 200 },
  HERO: { width: 1200, height: 600 },
  PROFILE: { width: 400, height: 400 },
};

// SEO
export const SITE_NAME = 'KNSCL - Kenya National Sub County League';
export const SITE_DESCRIPTION = 'Official website of the Kenya National Sub County League';
export const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://knscl.co.ke';

// Social Media
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/knscl',
  TWITTER: 'https://twitter.com/knscl',
  INSTAGRAM: 'https://instagram.com/knscl',
  YOUTUBE: 'https://youtube.com/knscl',
};

// Performance targets
export const PERF_TARGETS = {
  FIRST_LOAD: 2000,
  FIRST_PAINT: 1000,
  LARGEST_PAINT: 1500,
};

// News categories
export const NEWS_CATEGORIES = [
  { key: 'league', label: 'League News' },
  { key: 'club', label: 'Club News' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'events', label: 'Events' },
  { key: 'community', label: 'Community' },
];

// Gallery categories
export const GALLERY_CATEGORIES = [
  { key: 'match', label: 'Match Photos' },
  { key: 'club', label: 'Club Photos' },
  { key: 'player', label: 'Player Photos' },
  { key: 'ceremony', label: 'Award Ceremonies' },
  { key: 'community', label: 'Community Events' },
  { key: 'training', label: 'Training' },
];

// Fixture filters
export const FIXTURE_FILTERS = {
  STATUS: ['upcoming', 'live', 'completed'],
  COMPETITIONS: ['league', 'cup', 'super_cup'],
};

// Error messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load data. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CONTACT_SENT: 'Your message has been sent successfully.',
  SUBSCRIPTION_SUCCESS: 'You have been subscribed successfully.',
};
