"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Job } from "@/lib/types";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Filter, ChevronDown, ChevronUp, RotateCcw, Check, Heart, Share2, ExternalLink } from "lucide-react";
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
    <div className={`h-full overflow-hidden bg-gradient-to-br ${bgGradient} transition-all duration-700`}>
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
        </motion.div>
      </AnimatePresence>

      {/* Main Layout - Flexbox with 3 columns */}
      <div className="h-full flex items-stretch">
        {/* Left Spacer - Takes remaining space */}
        <div className="hidden md:flex flex-1 items-center justify-end pr-4">
          {/* Filter Button */}
          <div className="relative">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors duration-200 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Filter className="h-5 w-5" />
              <span className="text-sm font-medium">
                {categoryFilter === "all" ? "All Jobs" : JOB_CATEGORIES[categoryFilter as keyof typeof JOB_CATEGORIES]?.label}
              </span>
            </motion.button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="absolute top-full mt-2 right-0 p-2 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl min-w-[180px] z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setCategoryFilter("all");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        categoryFilter === "all"
                          ? "bg-primary text-white"
                          : "text-white hover:bg-white/10"
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
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          categoryFilter === key
                            ? "bg-primary text-white"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {info.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Content - 1/3 width on desktop, full on mobile */}
        <div className="w-full md:w-1/3 md:min-w-[380px] md:max-w-[480px] h-full flex flex-col">
          {/* Mobile Filter */}
          <div className="md:hidden flex justify-center py-3">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20"
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                {categoryFilter === "all" ? "All Jobs" : JOB_CATEGORIES[categoryFilter as keyof typeof JOB_CATEGORIES]?.label}
              </span>
            </motion.button>
          </div>

          {/* Scrollable Content Area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth rounded-2xl md:rounded-3xl overflow-hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Loading State */}
            {loading && (
              <div className="h-full flex items-center justify-center snap-start bg-black/40">
                <div className="text-center">
                  <motion.div
                    className="inline-block h-12 w-12 rounded-full border-4 border-solid border-white border-r-transparent mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-base text-white">Finding jobs...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="h-full flex items-center justify-center snap-start bg-black/40">
                <div className="text-center px-6">
                  <motion.div
                    className="text-5xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    💼
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-white">No jobs available</h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    {categoryFilter !== "all"
                      ? "Try a different filter"
                      : "Check back soon!"}
                  </p>
                  {categoryFilter !== "all" && (
                    <motion.button
                      onClick={() => setCategoryFilter("all")}
                      className="px-4 py-2 bg-primary text-white rounded-full font-medium text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Jobs
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Job Cards */}
            {!loading && jobs.length > 0 && jobs.map((job, index) => (
              <div
                key={job.id}
                id={`job-${index}`}
                data-index={index}
                className="h-full snap-start"
              >
                <JobShortCard job={job} isActive={currentIndex === index} />
              </div>
            ))}

            {/* All Done State */}
            {!loading && jobs.length > 0 && (
              <div className="h-full flex items-center justify-center snap-start bg-gradient-to-b from-black/60 to-primary/20">
                <div className="text-center px-6">
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-white">All caught up!</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    You've seen all available jobs
                  </p>
                  <motion.button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-center gap-4 py-3">
            <motion.button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              disabled={currentIndex >= jobs.length - 1}
              className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Right Side - Action Buttons (close to content) */}
        <div className="hidden md:flex items-center pl-4 pr-8">
          <div className="flex flex-col items-center gap-4">
            {/* Navigation Up */}
            <motion.button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronUp className="h-6 w-6" />
            </motion.button>

            {/* Action Buttons */}
            {currentJob && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Like/Save */}
                <motion.button
                  className="flex flex-col items-center gap-1 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] text-white/70 font-medium">Save</span>
                </motion.button>

                {/* Share */}
                <motion.button
                  className="flex flex-col items-center gap-1 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] text-white/70 font-medium">Share</span>
                </motion.button>

                {/* View Details */}
                <Link href={`/job/${currentJob.id}`}>
                  <motion.div
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                      <ExternalLink className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">Details</span>
                  </motion.div>
                </Link>

                {/* Accept Job */}
                <motion.button
                  className="flex flex-col items-center gap-1 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="p-2.5 rounded-full bg-primary group-hover:bg-primary/80 transition-colors shadow-lg shadow-primary/30">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] text-white/70 font-medium">Accept</span>
                </motion.button>

                {/* Pay Amount Badge */}
                <motion.div
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <span className="text-sm font-bold text-white">{formatCurrency(currentJob.pay)}</span>
                </motion.div>
              </motion.div>
            )}

            {/* Navigation Down */}
            <motion.button
              onClick={handleNext}
              disabled={currentIndex >= jobs.length - 1}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Right Spacer - Takes remaining space */}
        <div className="hidden md:block flex-1" />
      </div>
    </div>
  );
}
