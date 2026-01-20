"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES, CHARLOTTETOWN_NEIGHBORHOODS, getCategoryInfo } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { JobCategory, TimePreference } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory>("snow-removal");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState(CHARLOTTETOWN_NEIGHBORHOODS[0]);
  const [timePreference, setTimePreference] = useState<TimePreference>("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [pay, setPay] = useState("");

  // Poster info (in a real app with auth, this would come from the logged-in user)
  const [posterName, setPosterName] = useState("");
  const [posterPhone, setPosterPhone] = useState("");
  const [posterEmail, setPosterEmail] = useState("");

  // Get suggested pay range for selected category
  const suggestedPay = getCategoryInfo(category)?.suggestedPay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Create or get poster profile
      const posterProfile = {
        id: generateId(),
        name: posterName,
        type: 'senior' as const,
        phone: posterPhone,
        email: posterEmail,
        neighborhood,
      };

      // First create the profile
      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posterProfile),
      });

      const profileData = await profileResponse.json();

      if (!profileData.success) {
        throw new Error(profileData.error || 'Failed to create profile');
      }

      // Then create the job
      const jobData = {
        title,
        description,
        category,
        location: {
          address,
          lat: 46.2382, // Mock coordinates for MVP
          lng: -63.1311,
          neighborhood,
        },
        timePreference,
        scheduledDate: timePreference === 'scheduled' ? scheduledDate : undefined,
        pay: parseFloat(pay),
        postedBy: profileData.data.id,
      };

      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      const result = await jobResponse.json();

      if (result.success) {
        // Redirect to the job detail page
        router.push(`/job/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create job');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError('An error occurred while creating the job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <p className="text-muted-foreground">
          Need help with a task? Post it here and connect with local youth workers.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Describe what you need help with. Be clear and specific.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Remove snow from driveway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide details about the task..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                required
              >
                {Object.entries(JOB_CATEGORIES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Label>Location *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <Select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                >
                  {CHARLOTTETOWN_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Time Preference */}
            <div className="space-y-2">
              <Label htmlFor="timePreference">When do you need this done? *</Label>
              <Select
                id="timePreference"
                value={timePreference}
                onChange={(e) => setTimePreference(e.target.value as TimePreference)}
                required
              >
                <option value="asap">As Soon As Possible</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="scheduled">Specific Date</option>
              </Select>

              {timePreference === 'scheduled' && (
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Pay */}
            <div className="space-y-2">
              <Label htmlFor="pay">How much can you pay? *</Label>
              {suggestedPay && (
                <p className="text-sm text-muted-foreground">
                  Suggested: {formatCurrency(suggestedPay.min)} - {formatCurrency(suggestedPay.max)}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  id="pay"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="50"
                  value={pay}
                  onChange={(e) => setPay(e.target.value)}
                  required
                />
                <span className="text-sm text-muted-foreground">CAD</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poster Contact Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Contact Information</CardTitle>
            <CardDescription>
              How should workers reach you?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="posterName">Name *</Label>
              <Input
                id="posterName"
                placeholder="Your name"
                value={posterName}
                onChange={(e) => setPosterName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posterPhone">Phone *</Label>
              <Input
                id="posterPhone"
                type="tel"
                placeholder="(902) 555-1234"
                value={posterPhone}
                onChange={(e) => setPosterPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posterEmail">Email</Label>
              <Input
                id="posterEmail"
                type="email"
                placeholder="your.email@example.com"
                value={posterEmail}
                onChange={(e) => setPosterEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
