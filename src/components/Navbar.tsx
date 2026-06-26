"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, ChevronDown, Download, User, LogOut, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function Navbar() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.totalItems());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, profile, isGuest, isLoading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await signOut();
    toast.success("Logged out. See you soon!");
  };

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = isGuest
    ? "G"
    : (profile?.full_name ?? "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold font-syne text-white tracking-tight">
            <span className="text-primary">⚡</span> CrackKit
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-text-secondary hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-badge rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth state */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold font-syne">
                  {initials}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform", isDropdownOpen && "rotate-180")} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-white text-sm font-medium truncate">{displayName}</p>
                    <p className="text-text-secondary text-xs truncate">{user.email}</p>
                  </div>

                  {isGuest ? (
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-warning/10 transition-colors w-full"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade Account
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/dashboard/downloads"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-background/60 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        My Downloads
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-background/60 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </>
                  )}

                  <div className="border-t border-border mt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-badge hover:bg-badge/10 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-text-secondary hover:text-white transition-colors px-4 py-2 border border-border rounded-lg hover:border-text-secondary"
              >
                Login
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors px-4 py-2 rounded-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="relative p-2 text-text-secondary hover:text-white">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-badge rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="p-2 text-text-secondary hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-64px)] bg-background/95 backdrop-blur-lg border-t border-border flex flex-col p-4 gap-4 shadow-2xl">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-lg font-medium p-2 rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-white hover:bg-surface"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4 pb-8">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold font-syne shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{displayName}</p>
                    <p className="text-text-secondary text-xs truncate">{user.email}</p>
                  </div>
                </div>

                {isGuest ? (
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-sm font-medium text-white bg-warning hover:opacity-90 px-4 py-3 rounded-lg transition-opacity"
                  >
                    Upgrade Account
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/downloads"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-sm font-medium text-white bg-surface border border-border hover:bg-border px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    My Downloads
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full text-center text-sm font-medium text-badge border border-badge/30 hover:bg-badge/10 px-4 py-3 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-medium text-white px-4 py-3 border border-border rounded-lg hover:bg-surface transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-medium text-white bg-primary hover:bg-primary-hover px-4 py-3 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
