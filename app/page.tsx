"use client";

import { useEffect, useState } from "react";
import { Job } from "@/lib/types";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { JOB_CATEGORIES } from "@/lib/constants";
import { Briefcase, Filter } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter, statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Local Help in Charlottetown
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with UPEI students and local youth for snow removal, moving help,
              yard work, and more. Build trust in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/post-job">Post a Job</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#browse">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div id="browse" className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Available Jobs</h2>
            <p className="text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} available
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
                    {info.icon} {info.label}
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
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">
              {categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Be the first to post a job in your area!"}
            </p>
            <Button asChild>
              <Link href="/post-job">Post a Job</Link>
            </Button>
          </div>
        )}

        {/* Job Grid */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-t mt-16">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with a Task?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Post your job in minutes and connect with trusted local workers.
            From snow removal to moving help, we've got you covered.
          </p>
          <Button asChild size="lg">
            <Link href="/post-job">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
