"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import apiService from "../../services/api";

export default function StudentDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUserInfo(JSON.parse(userInfo));
    }
  }, []);

  useEffect(() => {
    const fetchAppeals = async () => {
      if (!userInfo) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStudentAppeals();
        setAppeals(response.appeals || []);
      } catch (error) {
        setError("Failed to load appeals. Please try again later.");
        setAppeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, [userInfo]);

  const handleSignOut = () => {
    localStorage.removeItem("userInfo");
    router.push("/login");
  };

  const handleNewAppeal = () => {
    router.push("/student/new");
  };

  const handleViewAppeal = (appealId) => {
    router.push(`/student/${appealId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "under review":
        return "bg-blue-100 text-blue-800";
      case "awaiting information":
        return "bg-orange-100 text-orange-800";
      case "decision made":
        return "bg-green-100 text-green-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (!userInfo) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appeals...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>

        <main
          id="main-content"
          className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
          role="main"
          aria-label="Student dashboard"
        >
          <div className="px-4 py-6 sm:px-0">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <button
                onClick={handleNewAppeal}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Submit a new academic appeal"
              >
                Submit New Appeal
              </button>
            </header>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <section
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
              aria-label="Appeal statistics"
            >
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Total Appeals
                </h2>
                <p
                  className="text-3xl font-bold text-purple-600"
                  aria-label={`Total appeals: ${appeals.length}`}
                >
                  {appeals.length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Submitted
                </h2>
                <p
                  className="text-3xl font-bold text-yellow-600"
                  aria-label={`Submitted appeals: ${
                    appeals.filter((a) => a.status === "submitted").length
                  }`}
                >
                  {appeals.filter((a) => a.status === "submitted").length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Under Review
                </h2>
                <p
                  className="text-3xl font-bold text-blue-600"
                  aria-label={`Under review appeals: ${
                    appeals.filter((a) => a.status === "under review").length
                  }`}
                >
                  {appeals.filter((a) => a.status === "under review").length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Awaiting Info
                </h2>
                <p
                  className="text-3xl font-bold text-orange-600"
                  aria-label={`Awaiting information appeals: ${
                    appeals.filter((a) => a.status === "awaiting information")
                      .length
                  }`}
                >
                  {
                    appeals.filter((a) => a.status === "awaiting information")
                      .length
                  }
                </p>
              </div>
            </section>

            <section
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
              aria-label="Additional appeal statistics"
            >
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Completed
                </h2>
                <p
                  className="text-3xl font-bold text-green-600"
                  aria-label={`Completed appeals: ${
                    appeals.filter(
                      (a) =>
                        a.status === "decision made" || a.status === "resolved"
                    ).length
                  }`}
                >
                  {
                    appeals.filter(
                      (a) =>
                        a.status === "decision made" || a.status === "resolved"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Rejected
                </h2>
                <p
                  className="text-3xl font-bold text-red-600"
                  aria-label={`Rejected appeals: ${
                    appeals.filter((a) => a.status === "rejected").length
                  }`}
                >
                  {appeals.filter((a) => a.status === "rejected").length}
                </p>
              </div>
            </section>

            <section className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  My Appeals
                </h2>
              </div>
              <div className="overflow-x-auto">
                {appeals.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500 mb-4">No appeals found.</p>
                    <button
                      onClick={handleNewAppeal}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      aria-label="Submit your first academic appeal"
                    >
                      Submit Your First Appeal
                    </button>
                  </div>
                ) : (
                  <table
                    className="min-w-full divide-y divide-gray-200"
                    role="table"
                    aria-label="List of your academic appeals"
                  >
                    <thead className="bg-gray-50">
                      <tr role="row">
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Type
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Status
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Submitted
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Last Updated
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Grounds
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                          role="columnheader"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appeals.map((appeal, index) => (
                        <tr
                          key={appeal._id}
                          className="hover:bg-gray-50"
                          role="row"
                        >
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            role="cell"
                          >
                            {appeal.appealType || "N/A"}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap"
                            role="cell"
                          >
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                appeal.status
                              )}`}
                              aria-label={`Status: ${
                                appeal.status || "Unknown"
                              }`}
                            >
                              {appeal.status || "Unknown"}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            role="cell"
                          >
                            {formatDate(appeal.createdAt)}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            role="cell"
                          >
                            {formatDate(appeal.updatedAt)}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            role="cell"
                          >
                            {appeal.grounds && appeal.grounds.length > 0
                              ? appeal.grounds.slice(0, 2).join(", ") +
                                (appeal.grounds.length > 2 ? "..." : "")
                              : "N/A"}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                            role="cell"
                          >
                            <button
                              onClick={() => handleViewAppeal(appeal._id)}
                              className="text-purple-600 hover:text-purple-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                              aria-label={`View details for appeal ${
                                index + 1
                              }`}
                            >
                              View Appeal
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
