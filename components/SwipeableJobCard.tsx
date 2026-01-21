"use client";

import { useState, useRef } from "react";
import { Job } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryInfo, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { MapPin, Clock, X, Heart } from "lucide-react";
import Link from "next/link";

interface SwipeableJobCardProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableJobCard({ job, onSwipe }: SwipeableJobCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const categoryInfo = getCategoryInfo(job.category);
  const statusColor = JOB_STATUS_COLORS[job.status];
  const statusLabel = JOB_STATUS_LABELS[job.status];

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 100) {
      const direction = currentX > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    setCurrentX(0);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (Math.abs(currentX) > 100) {
      const direction = currentX > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    setCurrentX(0);
    setIsDragging(false);
  };

  const rotation = currentX / 20;
  const opacity = 1 - Math.abs(currentX) / 300;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 touch-none select-none"
      style={{
        transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s, opacity 0.3s',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className="h-full w-full shadow-2xl border-2 cursor-grab active:cursor-grabbing">
        <CardContent className="p-8 h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">{categoryInfo.label}</Badge>
                <Badge className={`ml-2 ${statusColor}`}>{statusLabel}</Badge>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {formatCurrency(job.pay)}
                </div>
                <div className="text-sm text-muted-foreground">CAD</div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">{job.title}</h2>

            <p className="text-lg text-muted-foreground mb-6 line-clamp-4">
              {job.description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{job.location.neighborhood || job.location.address}</span>
            </div>

            <div className="flex items-center gap-3 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span>Posted {formatRelativeDate(job.postedAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-lg border-2"
                onClick={() => onSwipe('left')}
              >
                <X className="mr-2 h-6 w-6" />
                Pass
              </Button>
              <Button
                size="lg"
                className="flex-1 h-14 text-lg"
                asChild
              >
                <Link href={`/job/${job.id}`}>
                  <Heart className="mr-2 h-6 w-6" />
                  Interested
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Indicators */}
      {currentX > 50 && (
        <div className="absolute top-8 right-8 text-6xl font-bold text-green-500 opacity-70 rotate-12">
          INTERESTED
        </div>
      )}
      {currentX < -50 && (
        <div className="absolute top-8 left-8 text-6xl font-bold text-red-500 opacity-70 -rotate-12">
          PASS
        </div>
      )}
    </div>
  );
}
