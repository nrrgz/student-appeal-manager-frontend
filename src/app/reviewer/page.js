"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import apiService from "../../services/api";

export default function ReviewerDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [appeals, setAppeals] = useState([]);
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    department: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (!user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "reviewer") {
      router.push("/login");
      return;
    }

    setUserInfo(parsedUser);
    fetchAppeals();
  }, [router]);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getReviewerAppeals();
      const formattedAppeals = response.appeals.map((appeal) => ({
        id: appeal._id,
        studentName: appeal.student
          ? `${appeal.student.firstName} ${appeal.student.lastName}`
          : "Unknown Student",
        studentId: appeal.student?.studentId || "N/A",
        department: appeal.department || appeal.student?.department || "N/A",
        course: appeal.course || "N/A",
        status: appeal.status || "Pending",
        grounds: appeal.appealType || "N/A",
        submissionDate: appeal.createdAt,
        priority: appeal.priority || "Medium",
        deadline: appeal.deadline,
        reviewDeadline: appeal.reviewDeadline,
        assignedReviewer: appeal.assignedReviewer
          ? `${appeal.assignedReviewer.firstName} ${appeal.assignedReviewer.lastName}`
          : "Unassigned",
        appealType: appeal.appealType,
        description: appeal.statement,
        evidence: appeal.evidence || [],
        timeline: appeal.timeline || [],
        notes: appeal.notes || [],
      }));

      setAppeals(formattedAppeals);
      setFilteredAppeals(formattedAppeals);
    } catch (error) {
      setError("Failed to load appeals. Please try again.");
      setAppeals([]);
      setFilteredAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = appeals;

    if (newFilters.status) {
      filtered = filtered.filter(
        (appeal) => appeal.status === newFilters.status
      );
    }
    if (newFilters.priority) {
      filtered = filtered.filter(
        (appeal) => appeal.priority === newFilters.priority
      );
    }
    if (newFilters.department) {
      filtered = filtered.filter(
        (appeal) => appeal.department === newFilters.department
      );
    }
    if (newFilters.date) {
      filtered = filtered.filter((appeal) => {
        const appealDate = new Date(appeal.submissionDate);
        const filterDate = new Date(newFilters.date);
        return appealDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredAppeals(filtered);
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const apiFilters = {};
      if (filters.status) apiFilters.status = filters.status;
      if (filters.appealType) apiFilters.appealType = filters.appealType;

      const response = await apiService.getReviewerAppeals(apiFilters);
      const formattedAppeals = response.appeals.map((appeal) => ({
        id: appeal._id,
        studentName: appeal.student
          ? `${appeal.student.firstName} ${appeal.student.lastName}`
          : "Unknown Student",
        studentId: appeal.student?.studentId || "N/A",
        department: appeal.department || appeal.student?.department || "N/A",
        course: appeal.course || "N/A",
        status: appeal.status || "Pending",
        grounds: appeal.appealType || "N/A",
        submissionDate: appeal.createdAt,
        priority: appeal.priority || "Medium",
        deadline: appeal.deadline,
        reviewDeadline: appeal.reviewDeadline,
        assignedReviewer: appeal.assignedReviewer
          ? `${appeal.assignedReviewer.firstName} ${appeal.assignedReviewer.lastName}`
          : "Unassigned",
        appealType: appeal.appealType,
        description: appeal.statement,
        evidence: appeal.evidence || [],
        timeline: appeal.timeline || [],
        notes: appeal.notes || [],
      }));

      setAppeals(formattedAppeals);
      setFilteredAppeals(formattedAppeals);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      department: "",
      date: "",
    });
    fetchAppeals();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
      case "Submitted":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "under review":
      case "Under Review":
      case "In Review":
        return "bg-blue-100 text-blue-800";
      case "awaiting information":
      case "Awaiting Info":
        return "bg-orange-100 text-orange-800";
      case "resolved":
      case "decision made":
      case "Review Complete":
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-200 text-red-900";
      case "high":
        return "bg-orange-200 text-orange-900";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusCount = (status) => {
    return appeals.filter((appeal) => appeal.status === status).length;
  };

  const navigateToAppeal = (appealId) => {
    router.push(`/reviewer/${appealId}`);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appeals...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="reviewer">
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Academic Reviewer Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Total Assigned
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {appeals.length}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Submitted
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {getStatusCount("submitted")}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Under Review
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {getStatusCount("under review")}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Completed
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {getStatusCount("decision made") + getStatusCount("resolved")}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={fetchAppeals}
                        className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900"
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under review">Under Review</option>
                    <option value="awaiting information">
                      Awaiting Information
                    </option>
                    <option value="decision made">Decision Made</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Cases for Review ({filteredAppeals.length})
                </h3>
                <button
                  onClick={fetchAppeals}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                            Loading appeals...
                          </div>
                        </td>
                      </tr>
                    ) : filteredAppeals.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No appeals found matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppeals.map((appeal) => (
                        <tr key={appeal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appeal.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appeal.studentId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appeal.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                appeal.status
                              )}`}
                            >
                              {appeal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                appeal.priority
                              )}`}
                            >
                              {appeal.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appeal.deadline
                              ? new Date(appeal.deadline).toLocaleDateString()
                              : "No deadline"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigateToAppeal(appeal.id)}
                              className="text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                              Review Appeal
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
