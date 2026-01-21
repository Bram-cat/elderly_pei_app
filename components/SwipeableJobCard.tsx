"use client";

import { useState, useRef, useEffect } from "react";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { getCategoryInfo } from "@/lib/constants";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { MapPin, Clock, X, Heart, Info } from "lucide-react";
import Link from "next/link";

interface SwipeableJobCardProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableJobCard({ job, onSwipe }: SwipeableJobCardProps) {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const categoryInfo = getCategoryInfo(job.category);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [job.id]);

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setCurrentX(deltaX);
      setCurrentY(deltaY * 0.3);
    }
  };

  const handleEnd = () => {
    if (Math.abs(currentX) > 120) {
      const direction = currentX > 0 ? 'right' : 'left';
      setIsAnimating(true);
      const targetX = direction === 'right' ? 1000 : -1000;
      setCurrentX(targetX);
      setTimeout(() => {
        onSwipe(direction);
        setCurrentX(0);
        setCurrentY(0);
        setIsAnimating(false);
      }, 300);
    } else {
      setCurrentX(0);
      setCurrentY(0);
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const rotation = isDragging ? currentX / 30 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(currentX) / 400) : 1;
  const scale = isDragging ? Math.max(0.95, 1 - Math.abs(currentX) / 2000) : 1;

  const likeOpacity = Math.min(1, currentX / 100);
  const nopeOpacity = Math.min(1, -currentX / 100);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 p-4 touch-none select-none"
      style={{
        transform: `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        transition: isDragging || isAnimating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Main Card */}
      <div className="h-full w-full relative">
        <div className="h-full w-full bg-gradient-to-br from-card via-card to-secondary/20 rounded-3xl shadow-2xl overflow-hidden border-2 border-border cursor-grab active:cursor-grabbing">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10" />

          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between z-20">
            {/* Top Section */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {categoryInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1 bg-background/50 backdrop-blur-sm">
                    {job.location.neighborhood}
                  </Badge>
                </div>
                <div className="text-right bg-primary/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-primary/20">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(job.pay)}
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-bold leading-tight">
                {job.title}
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
                {job.description}
              </p>
            </div>

            {/* Bottom Section */}
            <div className="space-y-6">
              {/* Job Details */}
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{job.location.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Posted {formatRelativeDate(job.postedAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwipe('left');
                  }}
                  className="flex-1 h-16 rounded-full bg-white/90 hover:bg-white border-2 border-border shadow-lg flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="h-6 w-6 text-red-500" />
                  <span>Pass</span>
                </button>
                <Link
                  href={`/job/${job.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Info className="h-6 w-6" />
                  <span>Details</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Indicators */}
        <div
          className="absolute top-12 right-12 pointer-events-none"
          style={{
            opacity: likeOpacity,
            transform: `rotate(15deg) scale(${0.8 + likeOpacity * 0.2})`,
          }}
        >
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl border-4 border-green-400 shadow-2xl">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 fill-current" />
              <span className="text-3xl font-black">INTERESTED</span>
            </div>
          </div>
        </div>

        <div
          className="absolute top-12 left-12 pointer-events-none"
          style={{
            opacity: nopeOpacity,
            transform: `rotate(-15deg) scale(${0.8 + nopeOpacity * 0.2})`,
          }}
        >
          <div className="bg-red-500 text-white px-8 py-4 rounded-2xl border-4 border-red-400 shadow-2xl">
            <div className="flex items-center gap-2">
              <X className="h-8 w-8" />
              <span className="text-3xl font-black">PASS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
