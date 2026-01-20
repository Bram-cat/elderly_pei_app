// JSON file storage utilities for MVP (no database)
// In production, this would be replaced with a real database

import fs from 'fs';
import path from 'path';
import { Job, Profile, Review } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Generic file read/write functions
function readJsonFile<T>(filename: string): T[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Jobs storage
export const jobsStorage = {
  getAll: (): Job[] => readJsonFile<Job>('jobs.json'),

  getById: (id: string): Job | null => {
    const jobs = readJsonFile<Job>('jobs.json');
    return jobs.find((job) => job.id === id) || null;
  },

  create: (job: Job): Job => {
    const jobs = readJsonFile<Job>('jobs.json');
    jobs.push(job);
    writeJsonFile('jobs.json', jobs);
    return job;
  },

  update: (id: string, updates: Partial<Job>): Job | null => {
    const jobs = readJsonFile<Job>('jobs.json');
    const index = jobs.findIndex((job) => job.id === id);

    if (index === -1) return null;

    jobs[index] = { ...jobs[index], ...updates };
    writeJsonFile('jobs.json', jobs);
    return jobs[index];
  },

  delete: (id: string): boolean => {
    const jobs = readJsonFile<Job>('jobs.json');
    const filteredJobs = jobs.filter((job) => job.id !== id);

    if (filteredJobs.length === jobs.length) return false;

    writeJsonFile('jobs.json', filteredJobs);
    return true;
  },

  getByStatus: (status: Job['status']): Job[] => {
    const jobs = readJsonFile<Job>('jobs.json');
    return jobs.filter((job) => job.status === status);
  },

  getByProfileId: (profileId: string): Job[] => {
    const jobs = readJsonFile<Job>('jobs.json');
    return jobs.filter(
      (job) => job.postedBy === profileId || job.acceptedBy === profileId
    );
  },
};

// Profiles storage
export const profilesStorage = {
  getAll: (): Profile[] => readJsonFile<Profile>('profiles.json'),

  getById: (id: string): Profile | null => {
    const profiles = readJsonFile<Profile>('profiles.json');
    return profiles.find((profile) => profile.id === id) || null;
  },

  create: (profile: Profile): Profile => {
    const profiles = readJsonFile<Profile>('profiles.json');
    profiles.push(profile);
    writeJsonFile('profiles.json', profiles);
    return profile;
  },

  update: (id: string, updates: Partial<Profile>): Profile | null => {
    const profiles = readJsonFile<Profile>('profiles.json');
    const index = profiles.findIndex((profile) => profile.id === id);

    if (index === -1) return null;

    profiles[index] = { ...profiles[index], ...updates };
    writeJsonFile('profiles.json', profiles);
    return profiles[index];
  },

  delete: (id: string): boolean => {
    const profiles = readJsonFile<Profile>('profiles.json');
    const filteredProfiles = profiles.filter((profile) => profile.id !== id);

    if (filteredProfiles.length === profiles.length) return false;

    writeJsonFile('profiles.json', filteredProfiles);
    return true;
  },

  getByType: (type: Profile['type']): Profile[] => {
    const profiles = readJsonFile<Profile>('profiles.json');
    return profiles.filter((profile) => profile.type === type);
  },
};

// Reviews storage
export const reviewsStorage = {
  getAll: (): Review[] => readJsonFile<Review>('reviews.json'),

  getById: (id: string): Review | null => {
    const reviews = readJsonFile<Review>('reviews.json');
    return reviews.find((review) => review.id === id) || null;
  },

  create: (review: Review): Review => {
    const reviews = readJsonFile<Review>('reviews.json');
    reviews.push(review);
    writeJsonFile('reviews.json', reviews);

    // Update profile ratings
    updateProfileRating(review.revieweeId);

    return review;
  },

  getByJobId: (jobId: string): Review[] => {
    const reviews = readJsonFile<Review>('reviews.json');
    return reviews.filter((review) => review.jobId === jobId);
  },

  getByProfileId: (profileId: string): Review[] => {
    const reviews = readJsonFile<Review>('reviews.json');
    return reviews.filter((review) => review.revieweeId === profileId);
  },

  getByReviewerId: (reviewerId: string): Review[] => {
    const reviews = readJsonFile<Review>('reviews.json');
    return reviews.filter((review) => review.reviewerId === reviewerId);
  },
};

// Helper function to update profile rating after a new review
function updateProfileRating(profileId: string): void {
  const reviews = reviewsStorage.getByProfileId(profileId);

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  profilesStorage.update(profileId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
  });
}

// Initialize empty data files if they don't exist
export function initializeStorage(): void {
  ensureDataDir();

  const files = ['jobs.json', 'profiles.json', 'reviews.json'];

  files.forEach((file) => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
  });
}
