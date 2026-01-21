"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory>("snow-removal");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState<string>(CHARLOTTETOWN_NEIGHBORHOODS[0]);
  const [timePreference, setTimePreference] = useState<TimePreference>("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [pay, setPay] = useState("");

  // Poster info
  const [posterName, setPosterName] = useState("");
  const [posterPhone, setPosterPhone] = useState("");
  const [posterEmail, setPosterEmail] = useState("");

  const suggestedPay = getCategoryInfo(category)?.suggestedPay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const posterProfile = {
        id: generateId(),
        name: posterName,
        type: 'senior' as const,
        phone: posterPhone,
        email: posterEmail,
        neighborhood,
      };

      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posterProfile),
      });

      const profileData = await profileResponse.json();

      if (!profileData.success) {
        throw new Error(profileData.error || 'Failed to create profile');
      }

      const jobData = {
        title,
        description,
        category,
        location: {
          address,
          lat: 46.2382,
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
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Post a Job</h1>
          <p className="text-xl text-muted-foreground">
            Tell us what you need help with
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          <div className={`h-3 w-3 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-3 w-3 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-3 w-3 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              {/* Step 1: Job Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold mb-8">What do you need help with?</h2>

                  {/* Category - Large Buttons */}
                  <div className="space-y-4">
                    <Label className="text-2xl font-semibold">Type of Job</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(JOB_CATEGORIES).map(([key, info]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCategory(key as JobCategory)}
                          className={`p-6 rounded-xl border-2 text-left transition-all ${
                            category === key
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-xl font-bold mb-2">{info.label}</div>
                          <div className="text-sm text-muted-foreground">{info.description}</div>
                          <div className="text-sm font-semibold text-primary mt-2">
                            Suggested: {formatCurrency(info.suggestedPay.min)} - {formatCurrency(info.suggestedPay.max)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-2xl font-semibold">
                      Brief Description
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Remove snow from driveway"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="text-xl p-6 h-auto"
                    />
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full text-xl h-16"
                    onClick={() => setCurrentStep(2)}
                    disabled={!category || !title}
                  >
                    Next: Location & Time
                  </Button>
                </div>
              )}

              {/* Step 2: Location & Time */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold mb-8">Where and when?</h2>

                  {/* Address */}
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-2xl font-semibold">
                      Your Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="text-xl p-6 h-auto"
                    />
                  </div>

                  {/* Neighborhood */}
                  <div className="space-y-3">
                    <Label htmlFor="neighborhood" className="text-2xl font-semibold">
                      Area
                    </Label>
                    <Select
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="text-xl p-6 h-auto"
                    >
                      {CHARLOTTETOWN_NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Time Preference - Large Buttons */}
                  <div className="space-y-4">
                    <Label className="text-2xl font-semibold">When do you need this done?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: 'asap', label: 'As Soon As Possible' },
                        { value: 'today', label: 'Today' },
                        { value: 'this-week', label: 'This Week' },
                        { value: 'scheduled', label: 'Pick a Date' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTimePreference(option.value as TimePreference)}
                          className={`p-6 rounded-xl border-2 text-xl font-semibold transition-all ${
                            timePreference === option.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {timePreference === 'scheduled' && (
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                        className="text-xl p-6 h-auto"
                      />
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 text-xl h-16"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1 text-xl h-16"
                      onClick={() => setCurrentStep(3)}
                      disabled={!address}
                    >
                      Next: Your Info
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Payment */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold mb-8">Almost done!</h2>

                  {/* Pay */}
                  <div className="space-y-3">
                    <Label htmlFor="pay" className="text-2xl font-semibold">
                      How much can you pay?
                    </Label>
                    {suggestedPay && (
                      <p className="text-lg text-muted-foreground">
                        Suggested: {formatCurrency(suggestedPay.min)} - {formatCurrency(suggestedPay.max)}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold">$</span>
                      <Input
                        id="pay"
                        type="number"
                        min="0"
                        step="5"
                        placeholder="50"
                        value={pay}
                        onChange={(e) => setPay(e.target.value)}
                        required
                        className="text-3xl p-6 h-auto font-bold"
                      />
                      <span className="text-xl text-muted-foreground">CAD</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-2xl font-semibold">
                      Any additional details? (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add any extra information..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-xl p-6"
                    />
                  </div>

                  {/* Your Name */}
                  <div className="space-y-3">
                    <Label htmlFor="posterName" className="text-2xl font-semibold">
                      Your Name
                    </Label>
                    <Input
                      id="posterName"
                      placeholder="John Smith"
                      value={posterName}
                      onChange={(e) => setPosterName(e.target.value)}
                      required
                      className="text-xl p-6 h-auto"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <Label htmlFor="posterPhone" className="text-2xl font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="posterPhone"
                      type="tel"
                      placeholder="(902) 555-1234"
                      value={posterPhone}
                      onChange={(e) => setPosterPhone(e.target.value)}
                      required
                      className="text-xl p-6 h-auto"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-3">
                    <Label htmlFor="posterEmail" className="text-2xl font-semibold">
                      Email (Optional)
                    </Label>
                    <Input
                      id="posterEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={posterEmail}
                      onChange={(e) => setPosterEmail(e.target.value)}
                      className="text-xl p-6 h-auto"
                    />
                  </div>

                  {error && (
                    <div className="p-6 bg-destructive/10 text-destructive rounded-xl text-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 text-xl h-16"
                      onClick={() => setCurrentStep(2)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 text-xl h-16"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Job'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
