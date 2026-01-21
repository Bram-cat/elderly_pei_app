"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getCategoryInfo } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { MapPin, Clock, X, Check, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface JobShortCardProps {
  job: Job;
  isActive: boolean;
}

export default function JobShortCard({ job, isActive }: JobShortCardProps) {
  const router = useRouter();
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");

  const categoryInfo = getCategoryInfo(job.category);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAccepting(true);

    try {
      // Create worker profile
      const workerProfile = {
        name: workerName,
        type: 'youth' as const,
        phone: workerPhone,
        email: workerEmail,
      };

      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerProfile),
      });

      const profileData = await profileResponse.json();

      if (!profileData.success) {
        throw new Error('Failed to create worker profile');
      }

      // Update job status to accepted
      const jobResponse = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          acceptedBy: profileData.data.id,
        }),
      });

      const jobData = await jobResponse.json();

      if (jobData.success) {
        alert('Job accepted! The poster will be able to see your contact information.');
        setShowAcceptForm(false);
        router.push(`/job/${job.id}`);
      }
    } catch (error) {
      console.error("Error accepting job:", error);
      alert('Failed to accept job. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="h-full w-full relative bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80 z-0" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        {/* Top Section - Job Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-base px-4 py-1.5 bg-white/20 text-white border-white/30">
                {categoryInfo.label}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-1.5 bg-white/10 text-white border-white/30">
                {job.location.neighborhood}
              </Badge>
            </div>
            <div className="text-right bg-primary/90 backdrop-blur-sm rounded-2xl px-5 py-3 border-2 border-primary">
              <div className="text-4xl font-bold text-white">
                {formatCurrency(job.pay)}
              </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-white">
            {job.title}
          </h2>

          <p className="text-xl md:text-2xl text-gray-200 leading-relaxed line-clamp-4">
            {job.description}
          </p>
        </div>

        {/* Bottom Section - Details & Actions */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 space-y-4 border border-white/20">
            <div className="flex items-center gap-4">
              <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="text-lg font-medium text-white">{job.location.address}</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="text-lg font-medium text-white">Posted {formatRelativeDate(job.postedAt)}</span>
            </div>
          </div>

          {/* Accept Form */}
          {showAcceptForm ? (
            <form onSubmit={handleAccept} className="bg-white/15 backdrop-blur-lg rounded-3xl p-6 space-y-4 border border-white/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-white mb-4">Your Information</h3>

              <div>
                <label className="text-white text-lg font-medium mb-2 block">Your Name *</label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-white/20 border-2 border-white/30 text-white placeholder-white/50 text-lg focus:outline-none focus:border-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-white text-lg font-medium mb-2 block">Your Phone *</label>
                <input
                  type="tel"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-white/20 border-2 border-white/30 text-white placeholder-white/50 text-lg focus:outline-none focus:border-primary"
                  placeholder="(902) 555-1234"
                />
              </div>

              <div>
                <label className="text-white text-lg font-medium mb-2 block">Your Email (Optional)</label>
                <input
                  type="email"
                  value={workerEmail}
                  onChange={(e) => setWorkerEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/20 border-2 border-white/30 text-white placeholder-white/50 text-lg focus:outline-none focus:border-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAcceptForm(false)}
                  disabled={isAccepting}
                  className="flex-1 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 shadow-lg flex items-center justify-center gap-3 font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAccepting}
                  className="flex-1 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center gap-3 font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Check className="h-6 w-6" />
                  {isAccepting ? 'Accepting...' : 'Confirm'}
                </button>
              </div>
            </form>
          ) : (
            /* Action Buttons */
            <div className="flex gap-4">
              <Link
                href={`/job/${job.id}`}
                className="flex-1 h-20 rounded-full bg-white/15 hover:bg-white/25 text-white border-2 border-white/30 backdrop-blur-md shadow-lg flex items-center justify-center gap-3 font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Info className="h-7 w-7" />
                Details
              </Link>
              <button
                onClick={() => setShowAcceptForm(true)}
                className="flex-1 h-20 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Check className="h-7 w-7" />
                Accept Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
