"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Job } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Filter, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import JobShortCard from "@/components/JobShortCard";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

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

  return (
    <div className="h-screen overflow-hidden bg-black">
      {/* Filter Button - Top Left */}
      <div className="fixed top-20 left-4 z-50">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 border border-white/20"
        >
          <Filter className="h-5 w-5" />
          <span className="text-sm font-medium">
            {categoryFilter === "all" ? "All Jobs" : JOB_CATEGORIES[categoryFilter as keyof typeof JOB_CATEGORIES]?.label}
          </span>
        </button>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="mt-2 p-4 bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setShowFilters(false);
              }}
              className="w-48 bg-white/10 text-white border-white/20"
            >
              <option value="all">All Categories</option>
              {Object.entries(JOB_CATEGORIES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Navigation Arrows - Right Side */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= jobs.length - 1}
          className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

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
          <div className="h-screen flex items-center justify-center snap-start">
            <div className="text-center">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
              <p className="text-lg text-white">Finding jobs for you...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="h-screen flex items-center justify-center snap-start">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-2 text-white">No jobs available</h3>
              <p className="text-gray-400 mb-6">
                {categoryFilter !== "all"
                  ? "Try changing your filter to see more jobs"
                  : "Check back soon for new opportunities!"}
              </p>
              {categoryFilter !== "all" && (
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform duration-200"
                >
                  View All Jobs
                </button>
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
            className="h-screen snap-start relative"
          >
            <JobShortCard job={job} isActive={currentIndex === index} />
          </div>
        ))}

        {/* All Done State */}
        {!loading && jobs.length > 0 && (
          <div className="h-screen flex items-center justify-center snap-start bg-gradient-to-b from-black to-primary/20">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold mb-3 text-white">All caught up!</h3>
              <p className="text-lg text-gray-300 mb-6">
                You've viewed all available jobs. Great work!
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform duration-200"
              >
                <RotateCcw className="h-5 w-5" />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
