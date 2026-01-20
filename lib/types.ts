// Core data models for Charlottetown Odd Jobs Marketplace

export type JobCategory = 'snow-removal' | 'moving' | 'yard-work' | 'assembly' | 'repair' | 'other';

export type TimePreference = 'asap' | 'today' | 'this-week' | 'scheduled';

export type JobStatus = 'open' | 'accepted' | 'completed' | 'cancelled';

export type ProfileType = 'youth' | 'senior';

export interface Location {
  address: string;
  lat: number;
  lng: number;
  neighborhood?: string; // e.g., "UPEI Campus", "Downtown", "Brighton"
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  location: Location;
  timePreference: TimePreference;
  scheduledDate?: string; // ISO date string
  pay: number; // in CAD
  photos?: string[]; // URLs or paths
  postedBy: string; // profile ID
  postedAt: string; // ISO date string
  status: JobStatus;
  acceptedBy?: string; // profile ID
  acceptedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
}

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  bio?: string;
  school?: string; // For youth (e.g., "UPEI - Computer Science")
  skills?: string[]; // For youth (e.g., ["snow shoveling", "lifting", "yard work"])
  phone?: string;
  email?: string;
  photo?: string; // URL or path
  rating: number; // 0-5
  totalJobs: number;
  totalEarned?: number; // For youth, in CAD
  totalSpent?: number; // For seniors, in CAD
  favourites?: string[]; // For seniors - array of youth profile IDs
  joinedAt: string; // ISO date string
  neighborhood?: string; // General area in Charlottetown
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string; // profile ID of person giving review
  revieweeId: string; // profile ID of person being reviewed
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date string
}

// Filter and sort types for job browsing
export interface JobFilters {
  category?: JobCategory;
  timePreference?: TimePreference;
  minPay?: number;
  maxPay?: number;
  status?: JobStatus;
}

export type JobSortOption = 'newest' | 'pay-high' | 'pay-low' | 'distance';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
