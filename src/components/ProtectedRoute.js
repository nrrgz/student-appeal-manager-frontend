"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (
      !loading &&
      isAuthenticated &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      if (user?.role === "student") {
        router.push("/student");
      } else if (user?.role === "admin") {
        router.push("/admin");
      } else if (user?.role === "reviewer") {
        router.push("/reviewer");
      }
    }
  }, [loading, isAuthenticated, user, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
