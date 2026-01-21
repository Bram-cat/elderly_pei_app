"use client";

import { useEffect, useState } from "react";
import { Job } from "@/lib/types";
import SwipeableJobCard from "@/components/SwipeableJobCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Briefcase, Filter, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [passedJobs, setPassedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter, statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setPassedJobs([]);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

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
      // Pass on this job
      setPassedJobs([...passedJobs, jobs[currentIndex].id]);
    }
    // Move to next job
    setCurrentIndex(currentIndex + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setPassedJobs([]);
  };

  const currentJob = jobs[currentIndex];
  const hasMoreJobs = currentIndex < jobs.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-secondary/30 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Local Help in Charlottetown
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Swipe through jobs. Connect with UPEI students and local youth for snow removal, moving help, yard work, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/post-job">Post a Job</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="#browse">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div id="browse" className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Available Jobs</h2>
              <p className="text-muted-foreground">
                {currentIndex} of {jobs.length} viewed
                {passedJobs.length > 0 && ` • ${passedJobs.length} passed`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(JOB_CATEGORIES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </Select>
              </div>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-[180px]"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open Jobs</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-lg text-muted-foreground">Loading jobs...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-20">
              <Briefcase className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No jobs found</h3>
              <p className="text-lg text-muted-foreground mb-6">
                {categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to post a job in your area!"}
              </p>
              <Button asChild size="lg">
                <Link href="/post-job">Post a Job</Link>
              </Button>
            </div>
          )}

          {/* Swipeable Cards */}
          {!loading && jobs.length > 0 && hasMoreJobs && (
            <div className="relative h-[600px] max-w-2xl mx-auto">
              {/* Show current card and next card behind it */}
              {jobs.slice(currentIndex, currentIndex + 2).map((job, index) => (
                <div
                  key={job.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 10 - index,
                    transform: `scale(${1 - index * 0.05})`,
                    opacity: 1 - index * 0.3,
                  }}
                >
                  {index === 0 ? (
                    <SwipeableJobCard job={job} onSwipe={handleSwipe} />
                  ) : (
                    <div className="h-full w-full bg-card rounded-xl border-2 shadow-xl" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* All Done State */}
          {!loading && jobs.length > 0 && !hasMoreJobs && (
            <div className="text-center py-20">
              <h3 className="text-3xl font-semibold mb-4">You've seen all jobs!</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Check back later for new opportunities
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleReset} size="lg" variant="outline">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Review Again
                </Button>
                <Button asChild size="lg">
                  <Link href="/post-job">Post a Job</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary/30 border-t mt-16">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with a Task?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Post your job in minutes and connect with trusted local workers.
            From snow removal to moving help, we've got you covered.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/post-job">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
