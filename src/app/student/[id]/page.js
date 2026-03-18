"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function AppealDetail() {
  const [userInfo, setUserInfo] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUserInfo);
    if (user.role !== "student") {
      router.push("/login");
      return;
    }

    setUserInfo(user);
  }, [router]);

  useEffect(() => {
    const fetchAppeal = async () => {
      if (!userInfo || !params.id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStudentAppeal(params.id);
        setAppeal(response.appeal);
      } catch (error) {
        setError("Failed to load appeal details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppeal();
  }, [userInfo, params.id]);

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
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatActionTitle = (action) => {
    switch (action) {
      case "deadline_set":
        return "Deadline set";
      case "deadline_set_bulk":
        return "Deadlines set";
      case "appeal_submitted":
        return "Appeal submitted";
      case "status_updated":
        return "Status updated";
      case "note_added":
        return "Note added";
      case "admin_note_added":
        return "Admin note added";
      case "appeal_assigned":
        return "Appeal assigned";
      case "priority_set":
        return "Priority set";
      default:
        return action
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  const handleDownload = async (file) => {
    try {
      if (!appeal || !appeal._id) {
        alert("Appeal information not available");
        return;
      }

      const filename = file.originalName || file.filename || file.name;
      if (!filename) {
        alert("File name not available");
        return;
      }

      const downloadUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/api/appeals/${appeal._id}/evidence/${encodeURIComponent(
        filename
      )}/download`;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in again.");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        file.originalName || file.filename || file.name || "download";

      link.setAttribute("data-token", token);

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(`Download failed: ${error.message}`);
    }
  };

  if (!userInfo || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Appeal
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/student")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Appeal Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The appeal you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <button
              onClick={() => router.push("/student")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {appeal.appealType || "Appeal Details"}
                </h2>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      appeal.status
                    )}`}
                  >
                    {appeal.status || "Unknown"}
                  </span>
                  <span className="text-sm text-gray-600">
                    Appeal ID: {appeal._id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Appeal Information Notice
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  Once submitted, appeals cannot be modified. If you need to
                  provide additional information, please contact the appeals
                  team directly.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Appeal Statement
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line break-words overflow-hidden">
                    {appeal.statement || "No statement provided."}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Supporting Evidence
                </h3>
                {Array.isArray(appeal.evidence) &&
                appeal.evidence.length > 0 ? (
                  <div className="space-y-3">
                    {appeal.evidence.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <svg
                            className="h-8 w-8 text-gray-400 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.originalName ||
                                file.filename ||
                                file.name ||
                                "Unknown file"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.fileSize
                                ? `${(file.fileSize / 1024 / 1024).toFixed(
                                    2
                                  )} MB`
                                : "Unknown size"}{" "}
                              • Uploaded {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:bg-purple-50 px-3 py-1 rounded-md transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No evidence files uploaded.</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Comments from Staff
                </h3>
                {Array.isArray(appeal.notes) &&
                appeal.notes.filter((note) => !note.isInternal).length > 0 ? (
                  <div className="space-y-4">
                    {appeal.notes
                      .filter((note) => !note.isInternal)
                      .map((comment, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r-md"
                        >
                          <p className="text-sm text-gray-900 mb-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {comment.author?.firstName}{" "}
                              {comment.author?.lastName}
                              {comment.author?.role &&
                                ` (${comment.author.role})`}
                            </span>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No comments yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Staff will add comments here as they review your appeal.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Status History & Comments
                </h3>
                {appeal.timeline && appeal.timeline.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {appeal.timeline.map((event, eventIdx) => (
                        <li key={eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== appeal.timeline.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(
                                    event.action
                                  )
                                    .replace("text-", "bg-")
                                    .replace("bg-yellow-100", "bg-yellow-500")
                                    .replace("bg-blue-100", "bg-blue-500")
                                    .replace("bg-orange-100", "bg-orange-500")
                                    .replace("bg-green-100", "bg-green-500")
                                    .replace("bg-red-100", "bg-red-500")}`}
                                >
                                  <svg
                                    className="h-4 w-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatActionTitle(event.action)}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {event.description}
                                  </p>
                                  {event.performedBy && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      by {event.performedBy.firstName}{" "}
                                      {event.performedBy.lastName}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  {formatDate(event.date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500">No status history available.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Appeal Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-600">{appeal.appealType || ""}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Grounds:</span>
                    {appeal.grounds && appeal.grounds.length > 0 ? (
                      <ul className="text-gray-600 mt-1">
                        {appeal.grounds.map((ground, index) => (
                          <li key={index}>• {ground}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">N/A</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Submitted:
                    </span>
                    <p className="text-gray-600">
                      {formatDate(appeal.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Last Updated:
                    </span>
                    <p className="text-gray-600">
                      {formatDate(appeal.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-600">
                      {appeal.student?.firstName || "N/A"}{" "}
                      {appeal.student?.lastName || ""}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Student ID:
                    </span>
                    <p className="text-gray-600">
                      {appeal.student?.studentId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">
                      {appeal.student?.email || "N/A"}
                    </p>
                  </div>
                  {appeal.hasAdviser && (
                    <>
                      <div className="pt-3 border-t border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Adviser Information
                        </h4>
                        {appeal.adviserName && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Adviser Name:
                            </span>
                            <p className="text-gray-600">
                              {appeal.adviserName}
                            </p>
                          </div>
                        )}
                        {appeal.adviserEmail && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Adviser Email:
                            </span>
                            <p className="text-gray-600">
                              {appeal.adviserEmail}
                            </p>
                          </div>
                        )}
                        {appeal.adviserPhone && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Adviser Phone:
                            </span>
                            <p className="text-gray-600">
                              {appeal.adviserPhone}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Help & FAQ
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          Need Immediate Help?
                        </h4>
                        <p className="mt-1 text-sm text-blue-700">
                          Contact the Appeals Team at{" "}
                          <a
                            href="mailto:appeals@sheffield.ac.uk"
                            className="font-medium underline hover:text-blue-800"
                          >
                            appeals@sheffield.ac.uk
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>Can I edit my appeal after submission?</span>
                        <svg
                          className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                        No, once submitted, appeals cannot be modified. If you
                        need to provide additional information, please contact
                        the appeals team directly.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>How long does the appeal process take?</span>
                        <svg
                          className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                        The typical appeal process takes 4-6 weeks. Complex
                        cases may take longer. You&apos;ll receive updates at
                        each stage.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>What happens if my appeal is rejected?</span>
                        <svg
                          className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                        If your appeal is rejected, you&apos;ll receive a
                        detailed explanation. You may have the right to request
                        a review of the decision.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>How do I upload additional evidence?</span>
                        <svg
                          className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                        Contact the appeals team to request permission to submit
                        additional evidence. They will guide you through the
                        process.
                      </div>
                    </details>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Useful Resources
                    </h4>
                    <div className="space-y-2 text-sm">
                      <a
                        href="https://sheffield.ac.uk/study/policies/appeals-complaints-current-students/academic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Appeals Policy & Procedures
                      </a>
                      <a
                        href="https://sheffield.ac.uk/study/support"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Student Support Services
                      </a>
                      <a
                        href="https://sheffield.ac.uk/registration/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Contact Academic Registry
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
