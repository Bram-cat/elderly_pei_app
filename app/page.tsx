"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Job } from "@/lib/types";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Filter, ChevronDown, ChevronUp, RotateCcw, Info, Check, Heart, Share2, ExternalLink } from "lucide-react";
import JobShortCard from "@/components/JobShortCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

// Map job categories to background colors (extracted from images)
const categoryBackgrounds: Record<string, string> = {
  'snow-removal': 'from-blue-950 via-slate-900 to-blue-950',
  'moving': 'from-amber-950 via-stone-900 to-amber-950',
  'yard-work': 'from-green-950 via-emerald-900 to-green-950',
  'assembly': 'from-orange-950 via-amber-900 to-orange-950',
  'repair': 'from-slate-900 via-gray-800 to-slate-900',
  'other': 'from-purple-950 via-slate-900 to-purple-950',
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    setCurrentIndex(0);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      params.append("status", "open");

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToJob = useCallback((index: number) => {
    if (index < 0 || index >= jobs.length) return;

    setIsScrolling(true);
    setCurrentIndex(index);

    const element = document.getElementById(`job-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, [jobs.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < jobs.length - 1) {
      scrollToJob(currentIndex + 1);
    }
  }, [currentIndex, jobs.length, scrollToJob]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      scrollToJob(currentIndex - 1);
    }
  }, [currentIndex, scrollToJob]);

  const handleReset = () => {
    setCurrentIndex(0);
    scrollToJob(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  // Scroll detection
  useEffect(() => {
    if (isScrolling) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setCurrentIndex(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    const jobElements = document.querySelectorAll('[data-index]');
    jobElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [jobs, isScrolling]);

  // Get current job's category for dynamic background
  const currentJob = jobs[currentIndex];
  const currentCategory = currentJob?.category || 'other';
  const bgGradient = categoryBackgrounds[currentCategory] || categoryBackgrounds['other'];

  return (
    <div className={`h-screen overflow-hidden bg-gradient-to-br ${bgGradient} flex items-center justify-center relative transition-all duration-700`}>
      {/* Animated Background Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative Background Blobs */}
          <motion.div
            className="absolute top-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.08, 0.15]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Filter Button - Top Center (OUTSIDE phone) */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-colors duration-200 border-2 border-white/30 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Filter className="h-6 w-6" />
          <span className="text-base font-semibold">
            {categoryFilter === "all" ? "All Jobs" : JOB_CATEGORIES[categoryFilter as keyof typeof JOB_CATEGORIES]?.label}
          </span>
        </motion.button>

        {/* Filter Dropdown */}
        {showFilters && (
          <motion.div
            className="mt-3 p-3 bg-black/95 backdrop-blur-lg border-2 border-white/30 rounded-2xl shadow-2xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setShowFilters(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  categoryFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                All Categories
              </button>
              {Object.entries(JOB_CATEGORIES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCategoryFilter(key);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    categoryFilter === key
                      ? "bg-primary text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* YouTube Shorts Style Side Actions - Right Side (OUTSIDE phone) */}
      <div className="hidden md:flex fixed right-8 lg:right-16 xl:right-24 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-6">
        {/* Navigation Up */}
        <motion.button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ChevronUp className="h-7 w-7" />
        </motion.button>

        {/* Action Buttons */}
        {currentJob && (
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Like/Save */}
            <motion.button
              className="flex flex-col items-center gap-1 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">Save</span>
            </motion.button>

            {/* Share */}
            <motion.button
              className="flex flex-col items-center gap-1 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <Share2 className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">Share</span>
            </motion.button>

            {/* View Details */}
            <Link href={`/job/${currentJob.id}`}>
              <motion.div
                className="flex flex-col items-center gap-1 group cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ExternalLink className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs text-white/80 font-medium">Details</span>
              </motion.div>
            </Link>

            {/* Accept Job */}
            <motion.button
              className="flex flex-col items-center gap-1 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="p-3 rounded-full bg-primary group-hover:bg-primary/80 transition-colors shadow-lg shadow-primary/30">
                <Check className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">Accept</span>
            </motion.button>

            {/* Pay Amount Badge */}
            <motion.div
              className="mt-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-lg font-bold text-white">{formatCurrency(currentJob.pay)}</span>
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Down */}
        <motion.button
          onClick={handleNext}
          disabled={currentIndex >= jobs.length - 1}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ChevronDown className="h-7 w-7" />
        </motion.button>

        {/* Job Counter */}
        {jobs.length > 0 && (
          <div className="mt-2 text-sm text-white/60 font-medium">
            {currentIndex + 1} / {jobs.length}
          </div>
        )}
      </div>

      {/* Mobile Navigation - Bottom */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <motion.button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-black/60 text-white backdrop-blur-md disabled:opacity-30"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
        <div className="px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-md">
          {currentIndex + 1} / {jobs.length || 1}
        </div>
        <motion.button
          onClick={handleNext}
          disabled={currentIndex >= jobs.length - 1}
          className="p-3 rounded-full bg-black/60 text-white backdrop-blur-md disabled:opacity-30"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Phone Container - Centered & Bigger */}
      <div className="relative w-full h-full md:w-[430px] md:h-[932px] lg:w-[460px] lg:h-[920px] md:max-h-[92vh] md:rounded-[3rem] md:shadow-2xl md:border-[10px] md:border-gray-900 overflow-hidden bg-black phone-container">
        {/* Phone Notch (desktop only) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-gray-900 rounded-b-3xl z-10" />

        {/* Main Content - Scrollable */}
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

        {/* Loading State */}
        {loading && (
          <div className="h-full flex items-center justify-center snap-start">
            <div className="text-center">
              <motion.div
                className="inline-block h-16 w-16 rounded-full border-4 border-solid border-white border-r-transparent mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-lg text-white">Finding jobs for you...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="h-full flex items-center justify-center snap-start">
            <div className="text-center max-w-md px-4">
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                💼
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 text-white">No jobs available</h3>
              <p className="text-gray-400 mb-6">
                {categoryFilter !== "all"
                  ? "Try changing your filter to see more jobs"
                  : "Check back soon for new opportunities!"}
              </p>
              {categoryFilter !== "all" && (
                <motion.button
                  onClick={() => setCategoryFilter("all")}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  View All Jobs
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Job Cards - YouTube Shorts Style */}
        {!loading && jobs.length > 0 && jobs.map((job, index) => (
          <div
            key={job.id}
            id={`job-${index}`}
            data-index={index}
            className="h-full snap-start relative"
          >
            <JobShortCard job={job} isActive={currentIndex === index} />
          </div>
        ))}

        {/* All Done State */}
        {!loading && jobs.length > 0 && (
          <div className="h-full md:h-full flex items-center justify-center snap-start bg-gradient-to-b from-black to-primary/20">
            <div className="text-center max-w-md px-4">
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <h3 className="text-3xl font-bold mb-3 text-white">All caught up!</h3>
              <p className="text-lg text-gray-300 mb-6">
                You've viewed all available jobs. Great work!
              </p>
              <motion.button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <RotateCcw className="h-5 w-5" />
                Start Over
              </motion.button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
