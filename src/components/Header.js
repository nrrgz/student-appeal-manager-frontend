"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleSignOut = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    if (logout) {
      logout();
    }
    router.push("/login");
  };

  const handleHelp = () => {
    if (pathname === "/") {
      const event = new CustomEvent("navigateToSection", { detail: "help" });
      window.dispatchEvent(event);
    } else {
      router.push("/#help-section");
    }
  };

  const handleContact = () => {
    if (pathname === "/") {
      const event = new CustomEvent("navigateToSection", { detail: "contact" });
      window.dispatchEvent(event);
    } else {
      router.push("/#contact-section");
    }
  };

  const getBackButton = () => {
    if (pathname.startsWith("/student/")) {
      return (
        <button
          onClick={() => router.push("/student")}
          className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
          aria-label="Return to student dashboard"
        >
          Back to Dashboard
        </button>
      );
    } else if (pathname.startsWith("/reviewer/")) {
      return (
        <button
          onClick={() => router.push("/reviewer")}
          className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
          aria-label="Return to reviewer dashboard"
        >
          Back to Dashboard
        </button>
      );
    } else if (pathname.startsWith("/admin/")) {
      return (
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
          aria-label="Return to admin dashboard"
        >
          Back to Dashboard
        </button>
      );
    }
    return null;
  };

  const getDashboardButton = () => {
    if (!isAuthenticated) return null;

    if (
      pathname === "/" ||
      (!pathname.startsWith("/student") &&
        !pathname.startsWith("/reviewer") &&
        !pathname.startsWith("/admin"))
    ) {
      const userRole = userInfo?.role || user?.role;
      if (userRole === "student") {
        return (
          <button
            onClick={() => router.push("/student")}
            className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
            aria-label="Go to student dashboard"
          >
            Student Dashboard
          </button>
        );
      } else if (userRole === "reviewer") {
        return (
          <button
            onClick={() => router.push("/reviewer")}
            className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
            aria-label="Go to reviewer dashboard"
          >
            Reviewer Dashboard
          </button>
        );
      } else if (userRole === "admin") {
        return (
          <button
            onClick={() => router.push("/admin")}
            className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
            aria-label="Go to admin dashboard"
          >
            Admin Dashboard
          </button>
        );
      }
    }
    return null;
  };

  const isAuthenticated = user || userInfo;

  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="University of Sheffield Student Appeal Manager - Home"
            >
              <Image
                src="/images/logo.png"
                alt="University of Sheffield Logo"
                width={120}
                height={40}
                className="w-30 object-contain"
              />
            </Link>
          </div>
          <nav
            className="flex items-center space-x-4"
            role="navigation"
            aria-label="User navigation"
          >
            {isAuthenticated ? (
              <>
                {getBackButton()}
                {getDashboardButton()}
                <span
                  className="text-sm text-gray-700"
                  aria-label={`Welcome, ${
                    userInfo?.name || user?.firstName || "User"
                  }`}
                >
                  Welcome, {userInfo?.name || user?.firstName || "User"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleHelp}
                  className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                  aria-label="Get help and support"
                >
                  Help
                </button>
                <button
                  onClick={handleContact}
                  className="text-gray-600 hover:text-purple-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                  aria-label="Contact us"
                >
                  Contact
                </button>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Login to your account"
                >
                  Login
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Get started with the appeal system"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
