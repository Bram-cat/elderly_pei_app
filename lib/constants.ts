// Charlottetown/UPEI specific constants and configuration

import { JobCategory } from './types';

// Job categories with local context
export const JOB_CATEGORIES = {
  'snow-removal': {
    label: 'Snow Removal',
    icon: '❄️',
    description: 'Driveway & walkway snow shoveling',
    suggestedPay: { min: 50, max: 150 },
    seasonal: 'winter', // Dec-Mar
  },
  'moving': {
    label: 'Moving Help',
    icon: '📦',
    description: 'Furniture & boxes, local moves',
    suggestedPay: { min: 25, max: 40 }, // per hour
    seasonal: 'all',
  },
  'yard-work': {
    label: 'Yard Work',
    icon: '🌱',
    description: 'Lawn care, raking, gardening',
    suggestedPay: { min: 20, max: 30 }, // per hour
    seasonal: 'spring-fall', // Apr-Nov
  },
  'assembly': {
    label: 'Furniture Assembly',
    icon: '🔧',
    description: 'IKEA & online purchases',
    suggestedPay: { min: 30, max: 50 }, // flat rate
    seasonal: 'all',
  },
  'repair': {
    label: 'Minor Repairs',
    icon: '🛠️',
    description: 'Light fixtures, shelves, caulking',
    suggestedPay: { min: 25, max: 50 }, // flat rate
    seasonal: 'all',
  },
  'other': {
    label: 'Other Tasks',
    icon: '✨',
    description: 'Various odd jobs',
    suggestedPay: { min: 20, max: 40 }, // per hour
    seasonal: 'all',
  },
} as const;

// Charlottetown neighborhoods (for location tagging)
export const CHARLOTTETOWN_NEIGHBORHOODS = [
  'UPEI Campus',
  'Downtown Charlottetown',
  'Brighton',
  'West Royalty',
  'East Royalty',
  'Parkdale',
  'Sherwood',
  'Winsloe',
  'Cornwall',
  'Stratford',
] as const;

// UPEI programs (for youth profiles)
export const UPEI_PROGRAMS = [
  'Arts',
  'Business',
  'Computer Science',
  'Education',
  'Engineering',
  'Nursing',
  'Science',
  'Veterinary Medicine',
  'Other',
] as const;

// Common skills for youth workers
export const YOUTH_SKILLS = [
  'Snow Shoveling',
  'Heavy Lifting',
  'Yard Work',
  'Furniture Assembly',
  'Painting',
  'Cleaning',
  'Pet Care',
  'Driving',
  'Carpentry',
  'Electrical Work (minor)',
] as const;

// PEI minimum wage context (for pricing)
export const PEI_WAGE_INFO = {
  minimumWage: 17.0, // CAD per hour as of April 2026
  suggestedHourly: { min: 17, max: 25 },
  currencySymbol: 'CAD',
} as const;

// Location defaults for Charlottetown
export const CHARLOTTETOWN_CENTER = {
  lat: 46.2382,
  lng: -63.1311,
  name: 'UPEI Campus',
} as const;

export const SERVICE_RADIUS_KM = 10; // 10km covers Charlottetown metro

// Time preference labels
export const TIME_PREFERENCES = {
  asap: 'As Soon As Possible',
  today: 'Today',
  'this-week': 'This Week',
  scheduled: 'Scheduled Date',
} as const;

// Status labels
export const JOB_STATUS_LABELS = {
  open: 'Open',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

// Status colors for badges
export const JOB_STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

// Get category info helper
export function getCategoryInfo(category: JobCategory) {
  return JOB_CATEGORIES[category];
}

// Get suggested pay range for a category
export function getSuggestedPay(category: JobCategory) {
  return JOB_CATEGORIES[category].suggestedPay;
}

// Get current season (for highlighting relevant categories)
export function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'fall' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 12 || month <= 3) return 'winter';
  if (month >= 4 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
}

// Check if category is seasonal and relevant now
export function isCategoryRelevant(category: JobCategory): boolean {
  const categoryInfo = JOB_CATEGORIES[category];
  if (categoryInfo.seasonal === 'all') return true;

  const currentSeason = getCurrentSeason();

  if (categoryInfo.seasonal === 'winter') return currentSeason === 'winter';
  if (categoryInfo.seasonal === 'spring-fall') {
    return ['spring', 'fall'].includes(currentSeason);
  }

  return true;
}
