"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Job, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategoryInfo, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatRelativeDate, generateId } from "@/lib/utils";
import { MapPin, Clock, DollarSign, User, Phone, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [poster, setPoster] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [jobId, setJobId] = useState<string>("");

  // Worker info for accepting job
  const [workerName, setWorkerName] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setJobId(id);
      fetchJobDetails(id);
    });
  }, []);

  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.data);

        // Fetch poster profile
        const profileResponse = await fetch(`/api/profiles/${data.data.postedBy}`);
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setPoster(profileData.data.profile);
        }
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setAccepting(true);
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
      const jobResponse = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          acceptedBy: profileData.data.id,
        }),
      });

      const jobData = await jobResponse.json();

      if (jobData.success) {
        setJob(jobData.data);
        setShowAcceptForm(false);
        alert('Job accepted! The poster will be able to see your contact information.');
      }
    } catch (error) {
      console.error("Error accepting job:", error);
      alert('Failed to accept job. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!job || !confirm('Mark this job as completed?')) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();

      if (data.success) {
        setJob(data.data);
        alert('Job marked as completed!');
      }
    } catch (error) {
      console.error("Error completing job:", error);
      alert('Failed to mark job as complete.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-6">This job may have been removed.</p>
          <Button asChild>
            <Link href="/">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(job.category);
  const statusColor = JOB_STATUS_COLORS[job.status];
  const statusLabel = JOB_STATUS_LABELS[job.status];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      {/* Job Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{categoryInfo.icon}</span>
            <div>
              <Badge variant="outline" className="mb-2">{categoryInfo.label}</Badge>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(job.pay)}
            </div>
            <div className="text-sm text-muted-foreground">CAD</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>

        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location.address}, {job.location.neighborhood}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Posted {formatRelativeDate(job.postedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Posted By */}
          {poster && (
            <Card>
              <CardHeader>
                <CardTitle>Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                    {poster.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{poster.name}</h3>
                    {poster.neighborhood && (
                      <p className="text-sm text-muted-foreground">{poster.neighborhood}</p>
                    )}

                    {/* Show contact info if job is accepted */}
                    {job.status === 'accepted' && (
                      <div className="mt-3 space-y-1 text-sm">
                        {poster.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{poster.phone}</span>
                          </div>
                        )}
                        {poster.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{poster.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.status === 'open' && !showAcceptForm && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowAcceptForm(true)}
                >
                  Accept This Job
                </Button>
              )}

              {job.status === 'open' && showAcceptForm && (
                <form onSubmit={handleAcceptJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerName">Your Name *</Label>
                    <Input
                      id="workerName"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workerPhone">Your Phone *</Label>
                    <Input
                      id="workerPhone"
                      type="tel"
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workerEmail">Your Email</Label>
                    <Input
                      id="workerEmail"
                      type="email"
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAcceptForm(false)}
                      disabled={accepting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={accepting} className="flex-1">
                      {accepting ? 'Accepting...' : 'Confirm'}
                    </Button>
                  </div>
                </form>
              )}

              {job.status === 'accepted' && (
                <>
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                    This job has been accepted and is in progress.
                  </div>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleMarkComplete}
                  >
                    Mark as Completed
                  </Button>
                </>
              )}

              {job.status === 'completed' && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                  This job has been completed.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">Category</div>
                <div className="text-muted-foreground">{categoryInfo.label}</div>
              </div>
              <div>
                <div className="font-medium mb-1">Time Preference</div>
                <div className="text-muted-foreground capitalize">
                  {job.timePreference.replace('-', ' ')}
                </div>
              </div>
              {job.scheduledDate && (
                <div>
                  <div className="font-medium mb-1">Scheduled Date</div>
                  <div className="text-muted-foreground">
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <div className="font-medium mb-1">Status</div>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
