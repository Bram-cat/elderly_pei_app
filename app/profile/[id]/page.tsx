"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [profileId, setProfileId] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setProfileId(id);
      fetchProfile(id);
    });
  }, []);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/profiles/${id}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-6">This profile may not exist.</p>
          <Button asChild>
            <Link href="/">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{profile.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-sm">
                    {profile.type === 'youth' ? 'Youth Worker' : 'Senior'}
                  </Badge>
                  {profile.school && (
                    <Badge variant="outline" className="text-sm">
                      {profile.school}
                    </Badge>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.neighborhood && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{profile.neighborhood}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{profile.rating.toFixed(1)} Rating</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>{profile.totalJobs} Jobs</span>
              </div>
              {profile.totalEarned !== undefined && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span>{formatCurrency(profile.totalEarned)} Earned</span>
                </div>
              )}
              {profile.totalSpent !== undefined && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <span>{formatCurrency(profile.totalSpent)} Spent</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills (Youth only) */}
          {profile.type === 'youth' && profile.skills && profile.skills.length > 0 && (
            <Card className="border-2 md:col-span-2">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
