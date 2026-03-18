"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Footer from "../../components/Footer";
import apiService from "../../services/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [appeals, setAppeals] = useState([]);
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    date: "",
    grounds: "",
    deadlineStatus: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(storedUserInfo);
    if (user.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    setUserInfo(user);
  }, []);

  useEffect(() => {
    if (userInfo) {
      fetchData();
    }
  }, [userInfo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appealsResponse, dashboardResponse] = await Promise.all([
        apiService.getAdminAppeals(),
        apiService.getAdminDashboard(),
      ]);

      const formattedAppeals = appealsResponse.appeals.map((appeal) => ({
        id: appeal._id,
        studentName: appeal.student
          ? `${appeal.student.firstName} ${appeal.student.lastName}`
          : "Unknown Student",
        studentId: appeal.student?.studentId || "",
        department:
          appeal.department ||
          appeal.student?.department ||
          "Unknown Department",
        status: appeal.status || "Pending",
        grounds: appeal.appealType || "",
        submissionDate: appeal.createdAt,
        priority: appeal.priority || "Medium",
        deadline: appeal.deadline,
        assignedReviewer: appeal.assignedReviewer
          ? `${appeal.assignedReviewer.firstName} ${appeal.assignedReviewer.lastName}`
          : "Unassigned",
      }));

      setAppeals(formattedAppeals);
      setFilteredAppeals(formattedAppeals);

      const stats = dashboardResponse.statusSummary;
      setDashboardStats({
        total: dashboardResponse.total || 0,
        pending: stats.submitted || 0,
        resolved: (stats.resolved || 0) + (stats["decision made"] || 0),
        highPriority: 0,
        overdue: dashboardResponse.deadlineSummary?.overdue || 0,
        dueToday: dashboardResponse.deadlineSummary?.dueToday || 0,
        dueThisWeek: dashboardResponse.deadlineSummary?.dueThisWeek || 0,
      });

      const highPriorityCount = formattedAppeals.filter(
        (appeal) => appeal.priority === "high" || appeal.priority === "urgent"
      ).length;
      setDashboardStats((prev) => ({
        ...prev,
        highPriority: highPriorityCount,
      }));
    } catch (error) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = appeals;

    if (newFilters.department) {
      filtered = filtered.filter((appeal) =>
        appeal.department
          .toLowerCase()
          .includes(newFilters.department.toLowerCase())
      );
    }

    if (newFilters.status) {
      filtered = filtered.filter((appeal) => {
        return appeal.status === newFilters.status;
      });
    }

    if (newFilters.grounds) {
      filtered = filtered.filter((appeal) =>
        appeal.grounds.toLowerCase().includes(newFilters.grounds.toLowerCase())
      );
    }

    if (newFilters.date) {
      const filterDate = new Date(newFilters.date);
      filtered = filtered.filter((appeal) => {
        const appealDate = new Date(appeal.submissionDate);
        return appealDate.toDateString() === filterDate.toDateString();
      });
    }

    if (newFilters.deadlineStatus) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((appeal) => {
        if (!appeal.deadline) {
          return newFilters.deadlineStatus === "noDeadline";
        }

        const deadline = new Date(appeal.deadline);

        switch (newFilters.deadlineStatus) {
          case "overdue":
            return deadline < now;
          case "dueToday":
            return (
              deadline >= today &&
              deadline < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          case "dueThisWeek":
            return deadline >= now && deadline <= weekFromNow;
          default:
            return true;
        }
      });
    }

    setFilteredAppeals(filtered);
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      status: "",
      date: "",
      grounds: "",
      deadlineStatus: "",
    });
    setFilteredAppeals(appeals);
  };

  const refreshData = () => {
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "under review":
      case "In Review":
        return "bg-blue-100 text-blue-800";
      case "awaiting information":
      case "Awaiting Info":
        return "bg-orange-100 text-orange-800";
      case "resolved":
      case "decision made":
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin/reports")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Reports
              </button>
              <button
                onClick={refreshData}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Refresh Data
              </button>
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
                      onClick={fetchData}
                      className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Appeals
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.resolved}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    High Priority
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardStats.highPriority}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Overdue Appeals
                  </p>
                  <p className="text-2xl font-semibold text-red-600">
                    {dashboardStats.overdue || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Due Today</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {dashboardStats.dueToday || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Due This Week
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {dashboardStats.dueThisWeek || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
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
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={filters.deadlineStatus}
                    onChange={(e) =>
                      handleFilterChange("deadlineStatus", e.target.value)
                    }
                  >
                    <option value="">All Deadlines</option>
                    <option value="overdue">Overdue</option>
                    <option value="dueToday">Due Today</option>
                    <option value="dueThisWeek">Due This Week</option>
                    <option value="noDeadline">No Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grounds
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Late Submission"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={filters.grounds}
                    onChange={(e) =>
                      handleFilterChange("grounds", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  All Appeals ({filteredAppeals.length})
                </h3>
                <span className="text-sm text-gray-500">
                  Showing {filteredAppeals.length} of {appeals.length} appeals
                </span>
              </div>
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
                      Grounds
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppeals.length > 0 ? (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appeal.department}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appeal.grounds}
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
                          {appeal.deadline ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                new Date(appeal.deadline) < new Date()
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {new Date(appeal.deadline).toLocaleDateString()}
                              {new Date(appeal.deadline) < new Date() &&
                                " (OVERDUE)"}
                            </span>
                          ) : (
                            <span className="text-gray-500">No deadline</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appeal.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`/admin/${appeal.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {appeals.length === 0
                          ? "No appeals found in the system."
                          : "No appeals match the current filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
