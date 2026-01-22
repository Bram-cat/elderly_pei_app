"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES, CHARLOTTETOWN_NEIGHBORHOODS, getCategoryInfo } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { JobCategory, TimePreference } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const QUICK_PAY_OPTIONS = [25, 50, 75, 100];

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showDescription, setShowDescription] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory>("snow-removal");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState<string>(CHARLOTTETOWN_NEIGHBORHOODS[0]);
  const [timePreference, setTimePreference] = useState<TimePreference>("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [pay, setPay] = useState("");
  const [customPay, setCustomPay] = useState("");

  // Poster info
  const [posterName, setPosterName] = useState("");
  const [posterPhone, setPosterPhone] = useState("");
  const [posterEmail, setPosterEmail] = useState("");

  const suggestedPay = getCategoryInfo(category)?.suggestedPay;

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 200 }
    })
  };

  const handlePaySelect = (amount: number) => {
    setPay(String(amount));
    setCustomPay("");
  };

  const handleCustomPayChange = (value: string) => {
    setCustomPay(value);
    setPay(value);
  };

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
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Post a Job</h1>
          <p className="text-xl text-muted-foreground">
            Tell us what you need help with
          </p>
        </motion.div>

        {/* Progress Indicator - 2 Steps */}
        <div className="flex justify-center gap-3 mb-8">
          <motion.div
            className={`h-3 w-12 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          <motion.div
            className={`h-3 w-12 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {/* Step 1: Job Details (Category, Title, Pay, Time) */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    className="space-y-8"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  >
                    <h2 className="text-3xl font-bold">What do you need help with?</h2>

                    {/* Category - Large Buttons */}
                    <div className="space-y-4">
                      <Label className="text-2xl font-semibold">Type of Job</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(JOB_CATEGORIES).map(([key, info], index) => (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => setCategory(key as JobCategory)}
                            className={`p-6 rounded-xl border-2 text-left transition-colors ${
                              category === key
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-xl font-bold mb-2">{info.label}</div>
                            <div className="text-sm text-muted-foreground">{info.description}</div>
                            <div className="text-sm font-semibold text-primary mt-2">
                              Suggested: {formatCurrency(info.suggestedPay.min)} - {formatCurrency(info.suggestedPay.max)}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <motion.div
                      className="space-y-3"
                      custom={6}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
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
                    </motion.div>

                    {/* Quick Pay Buttons */}
                    <motion.div
                      className="space-y-4"
                      custom={7}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label className="text-2xl font-semibold">How much will you pay?</Label>
                      {suggestedPay && (
                        <p className="text-base text-muted-foreground">
                          Suggested for {getCategoryInfo(category)?.label}: {formatCurrency(suggestedPay.min)} - {formatCurrency(suggestedPay.max)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {QUICK_PAY_OPTIONS.map((amount) => (
                          <motion.button
                            key={amount}
                            type="button"
                            onClick={() => handlePaySelect(amount)}
                            className={`px-6 py-4 rounded-2xl font-bold text-xl transition-colors ${
                              pay === String(amount) && !customPay
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ${amount}
                          </motion.button>
                        ))}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">$</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Other"
                            value={customPay}
                            onChange={(e) => handleCustomPayChange(e.target.value)}
                            className="w-28 text-xl p-4 h-auto text-center font-bold"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Time Preference */}
                    <motion.div
                      className="space-y-4"
                      custom={8}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label className="text-2xl font-semibold">When do you need this done?</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: 'asap', label: 'ASAP' },
                          { value: 'today', label: 'Today' },
                          { value: 'this-week', label: 'This Week' },
                          { value: 'scheduled', label: 'Pick Date' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setTimePreference(option.value as TimePreference)}
                            className={`py-4 px-4 rounded-xl font-semibold text-base transition-colors ${
                              timePreference === option.value
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {timePreference === 'scheduled' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Input
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              required
                              className="text-xl p-6 h-auto mt-3"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="button"
                        size="lg"
                        className="w-full text-xl h-16"
                        onClick={() => setCurrentStep(2)}
                        disabled={!category || !title || !pay}
                      >
                        Next: Your Details
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Location & Contact */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    className="space-y-8"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  >
                    <h2 className="text-3xl font-bold">Almost done!</h2>

                    {/* Address */}
                    <motion.div
                      className="space-y-3"
                      custom={0}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
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
                    </motion.div>

                    {/* Neighborhood - Chips */}
                    <motion.div
                      className="space-y-3"
                      custom={1}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label className="text-2xl font-semibold">Area</Label>
                      <div className="flex flex-wrap gap-2">
                        {CHARLOTTETOWN_NEIGHBORHOODS.map((n) => (
                          <motion.button
                            key={n}
                            type="button"
                            onClick={() => setNeighborhood(n)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              neighborhood === n
                                ? 'bg-primary text-white'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {n}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Description - Collapsible */}
                    <motion.div
                      className="space-y-3"
                      custom={2}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <button
                        type="button"
                        onClick={() => setShowDescription(!showDescription)}
                        className="flex items-center gap-2 text-xl font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showDescription ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        Add more details (optional)
                      </button>
                      <AnimatePresence>
                        {showDescription && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Textarea
                              id="description"
                              placeholder="Add any extra information..."
                              rows={4}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="text-xl p-6"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                      className="space-y-6"
                      custom={3}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Label className="text-2xl font-semibold">How can workers reach you?</Label>

                      <div className="space-y-4">
                        <Input
                          id="posterName"
                          placeholder="Your Name *"
                          value={posterName}
                          onChange={(e) => setPosterName(e.target.value)}
                          required
                          className="text-xl p-6 h-auto"
                        />

                        <Input
                          id="posterPhone"
                          type="tel"
                          placeholder="Phone Number *"
                          value={posterPhone}
                          onChange={(e) => setPosterPhone(e.target.value)}
                          required
                          className="text-xl p-6 h-auto"
                        />

                        <Input
                          id="posterEmail"
                          type="email"
                          placeholder="Email (Optional)"
                          value={posterEmail}
                          onChange={(e) => setPosterEmail(e.target.value)}
                          className="text-xl p-6 h-auto"
                        />
                      </div>
                    </motion.div>

                    {error && (
                      <motion.div
                        className="p-6 bg-destructive/10 text-destructive rounded-xl text-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full text-xl h-16"
                          onClick={() => setCurrentStep(1)}
                          disabled={isSubmitting}
                        >
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full text-xl h-16"
                          disabled={isSubmitting || !address || !posterName || !posterPhone}
                        >
                          {isSubmitting ? 'Posting...' : 'Post Job'}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
