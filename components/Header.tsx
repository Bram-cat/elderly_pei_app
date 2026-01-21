"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Browse Jobs", href: "/" },
    { label: "Post a Job", href: "/post-job" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-4 group transition-transform duration-200 hover:scale-105"
        >
          <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
            <Image
              src="/logo.png"
              alt="Charlottetown Odd Jobs"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl leading-none">
              Charlottetown
            </span>
            <span className="text-sm text-muted-foreground leading-none">
              Odd Jobs
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-lg font-semibold transition-all duration-200 relative group",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-1 bg-primary transition-all duration-200 rounded-full",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Desktop Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/profile/demo"
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover:scale-110"
          >
            <User className="h-7 w-7 text-primary" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <Menu className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container flex flex-col space-y-6 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xl font-semibold transition-all duration-200 hover:translate-x-2",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/profile/demo"
            className="flex items-center gap-3 text-xl font-semibold text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-6 w-6" />
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
