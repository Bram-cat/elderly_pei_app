"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link
            href="/"
            className="flex items-center space-x-4 group"
          >
            <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 group-hover:ring-4 transition-all duration-300">
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
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "px-6 py-3 text-lg font-bold rounded-2xl transition-all duration-300",
                  pathname === item.href
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20"
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.div
            whileHover={{
              scale: 1.1,
              boxShadow: "0 10px 25px -5px rgba(234, 99, 140, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href="/profile/demo"
              className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-transparent hover:border-primary/30 transition-colors duration-300"
            >
              <User className="h-8 w-8 text-primary" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <motion.button
          className="md:hidden p-3 rounded-xl hover:bg-primary/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-8 w-8" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-8 w-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <nav className="container flex flex-col space-y-4 py-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 text-xl font-bold rounded-xl transition-all duration-200",
                      pathname === item.href
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:translate-x-2"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <Link
                  href="/profile/demo"
                  className="flex items-center gap-3 px-4 py-3 text-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 hover:translate-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-6 w-6" />
                  Profile
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
