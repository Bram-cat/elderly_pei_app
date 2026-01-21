"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getCategoryInfo } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { MapPin, Clock, X, Check, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface JobShortCardProps {
  job: Job;
  isActive: boolean;
}

// Map job categories to images
const categoryImages: Record<string, string> = {
  'snow-removal': '/snow.jpg',
  'moving': '/furniture assembly.1.jpg',
  'yard-work': '/yardwork.jpg',
  'assembly': '/furniture assembly.webp',
  'repair': '/furniture assembly.1.jpg',
};

export default function JobShortCard({ job, isActive }: JobShortCardProps) {
  const router = useRouter();
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");

  const categoryInfo = getCategoryInfo(job.category);
  const backgroundImage = categoryImages[job.category] || '/snow.jpg';

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAccepting(true);

    try {
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
    <div className="h-full w-full relative bg-black overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={job.title}
          fill
          className="object-cover"
          priority={isActive}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      </div>

      {/* Content - Centered YouTube Shorts Style */}
      <div className="relative z-10 w-full max-w-md mx-auto h-full flex flex-col justify-end p-4 pb-6">
        {/* Top Info - Badges */}
        <div className="absolute top-20 left-4 right-4 flex items-start justify-between gap-2 z-20">
          <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-black/60 text-white border-white/30 backdrop-blur-md">
            {categoryInfo.label}
          </Badge>
          <div className="bg-primary/95 backdrop-blur-sm rounded-2xl px-4 py-2 border-2 border-primary shadow-lg">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(job.pay)}
            </div>
          </div>
        </div>

        {/* Main Content - Bottom */}
        <div className="space-y-3">
          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg">
              {job.title}
            </h2>
            <p className="text-base text-white/90 leading-relaxed line-clamp-2 drop-shadow-md">
              {job.description}
            </p>
          </div>

          {/* Location & Time */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 space-y-2 border border-white/20">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-white truncate">{job.location.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-white">Posted {formatRelativeDate(job.postedAt)}</span>
            </div>
          </div>

          {/* Accept Form */}
          {showAcceptForm ? (
            <form onSubmit={handleAccept} className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 space-y-3 border border-white/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-white">Your Information</h3>

              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-primary"
                placeholder="Your Name *"
              />

              <input
                type="tel"
                value={workerPhone}
                onChange={(e) => setWorkerPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-primary"
                placeholder="Your Phone *"
              />

              <input
                type="email"
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-primary"
                placeholder="Email (Optional)"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAcceptForm(false)}
                  disabled={isAccepting}
                  className="flex-1 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40 flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAccepting}
                  className="flex-1 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {isAccepting ? 'Accepting...' : 'Confirm'}
                </button>
              </div>
            </form>
          ) : (
            /* Action Buttons */
            <div className="flex gap-3">
              <Link
                href={`/job/${job.id}`}
                className="flex-1 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md flex items-center justify-center gap-2 font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Info className="h-5 w-5" />
                Details
              </Link>
              <button
                onClick={() => setShowAcceptForm(true)}
                className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Check className="h-5 w-5" />
                Accept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
