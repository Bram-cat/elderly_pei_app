"use client";

import { useEffect, useState, useRef } from "react";
import { Job } from "@/lib/types";
import SwipeableJobCard from "@/components/SwipeableJobCard";
import { Select } from "@/components/ui/select";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [passedJobs, setPassedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setPassedJobs([]);
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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setPassedJobs([...passedJobs, jobs[currentIndex].id]);
    }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setPassedJobs(prev => prev.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (currentIndex < jobs.length) {
      handleSwipe('right');
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setPassedJobs([]);
  };

  const hasMoreJobs = currentIndex < jobs.length;
  const progress = jobs.length > 0 ? ((currentIndex / jobs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background overflow-hidden">
      {/* Compact Header with Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {categoryFilter === "all" ? "All Jobs" : JOB_CATEGORIES[categoryFilter as keyof typeof JOB_CATEGORIES]?.label}
                </span>
              </button>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-full hover:bg-secondary transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {currentIndex} / {jobs.length}
              </span>
              {hasMoreJobs && (
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full hover:bg-secondary transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mt-2">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="max-w-2xl mx-auto mt-3 p-4 bg-card border rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setShowFilters(false);
                }}
                className="w-full"
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
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-lg text-muted-foreground">Finding jobs for you...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-2">No jobs available</h3>
              <p className="text-muted-foreground mb-6">
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

        {/* Swipeable Cards - Full Screen Experience */}
        {!loading && jobs.length > 0 && hasMoreJobs && (
          <div className="fixed inset-0 top-32 bottom-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full max-w-2xl h-full max-h-[calc(100vh-180px)] pointer-events-auto">
              {/* Stack of cards */}
              {jobs.slice(currentIndex, currentIndex + 3).map((job, index) => (
                <div
                  key={job.id}
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    zIndex: 20 - index,
                    transform: `scale(${1 - index * 0.04}) translateY(${index * 8}px)`,
                    opacity: 1 - index * 0.25,
                  }}
                >
                  {index === 0 ? (
                    <SwipeableJobCard
                      job={job}
                      onSwipe={handleSwipe}
                    />
                  ) : (
                    <div className="h-full w-full bg-card rounded-3xl border-2 border-border shadow-2xl" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Done State */}
        {!loading && jobs.length > 0 && !hasMoreJobs && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold mb-3">All caught up!</h3>
              <p className="text-lg text-muted-foreground mb-6">
                You've viewed all available jobs. Great work!
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform duration-200"
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
