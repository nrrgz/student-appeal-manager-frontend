"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function AppealManagement() {
  const params = useParams();
  const appealId = params.id;

  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineReason, setDeadlineReason] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

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

  const fetchAppeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminAppeal(appealId);
      setAppeal(response.appeal);
      setNewStatus(response.appeal.status);

      if (response.appeal.assignedReviewer) {
        setSelectedReviewer(response.appeal.assignedReviewer._id);
      }
      if (response.appeal.priority) {
        setSelectedPriority(response.appeal.priority);
      }
    } catch (error) {
      setError("Failed to load appeal data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableReviewers = async () => {
    try {
      const response = await apiService.getReviewers();
      setAvailableReviewers(response.reviewers || []);
    } catch (error) {}
  };

  useEffect(() => {
    if (appealId) {
      fetchAppeal();
    }
  }, [appealId]);

  useEffect(() => {
    fetchAvailableReviewers();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.trim() || submitting) return;

    try {
      setSubmitting(true);
      await apiService.addAdminNote(appealId, {
        content: newNote,
        isInternal: true,
      });

      await fetchAppeal();
      setNewNote("");
    } catch (error) {
      setError("Failed to add note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await apiService.addAdminNote(appealId, {
        content: newComment,
        isInternal: false,
      });

      await fetchAppeal();
      setNewComment("");
    } catch (error) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?") || submitting)
      return;

    try {
      setSubmitting(true);
      await apiService.deleteAdminNote(appealId, noteId);

      await fetchAppeal();
    } catch (error) {
      setError("Failed to delete note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?") || submitting)
      return;

    try {
      setSubmitting(true);
      await apiService.deleteAdminNote(appealId, commentId);

      await fetchAppeal();
    } catch (error) {
      setError("Failed to delete comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || submitting) return;

    try {
      setSubmitting(true);
      await apiService.updateAppealStatusAdmin(appealId, {
        status: newStatus,
        reason: `Status updated by admin: ${userInfo?.firstName || "Admin"}`,
      });

      await fetchAppeal();
    } catch (error) {
      setError("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
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

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return "No deadline set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid deadline";
    }
  };

  const handleSetDeadline = async () => {
    if (!newDeadline || submitting) return;

    try {
      setSubmitting(true);
      await apiService.setAppealDeadline(appealId, {
        deadline: newDeadline,
        reason: deadlineReason,
      });

      await fetchAppeal();
      setShowDeadlineModal(false);
      setNewDeadline("");
      setDeadlineReason("");
    } catch (error) {
      setError("Failed to set deadline. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAppeal = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const assignmentData = {};

      if (selectedReviewer !== undefined) {
        assignmentData.assignedReviewer = selectedReviewer || null;
      }
      if (selectedPriority) {
        assignmentData.priority = selectedPriority;
      }

      await apiService.updateAppealAssignment(appealId, assignmentData);

      await fetchAppeal();
      setShowAssignmentModal(false);
      setSelectedReviewer("");
      setSelectedPriority("");
    } catch (error) {
      setError("Failed to assign appeal. Please try again.");
    } finally {
      setSubmitting(false);
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
      }/api/admin/appeals/${appeal._id}/evidence/${encodeURIComponent(
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">{error ? error : "Appeal not found"}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Appeal Details
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        appeal.status
                      )}`}
                    >
                      {appeal.status || "Unknown"}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(
                        appeal.priority
                      )}`}
                    >
                      {appeal.priority || "No"} Priority
                    </span>
                    {appeal.deadline && (
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          new Date(appeal.deadline) < new Date()
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        Deadline:{" "}
                        {new Date(appeal.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appeal.student?.firstName} {appeal.student?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appeal.student?.studentId || appeal.studentId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appeal.student?.email || appeal.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appeal.department || appeal.student?.department}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Appeal Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appeal.appealType || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Submission Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(appeal.createdAt)}
                    </p>
                  </div>
                </div>

                {appeal.hasAdviser && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Adviser Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appeal.adviserName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Adviser Name
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {appeal.adviserName}
                          </p>
                        </div>
                      )}
                      {appeal.adviserEmail && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Adviser Email
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {appeal.adviserEmail}
                          </p>
                        </div>
                      )}
                      {appeal.adviserPhone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Adviser Phone
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {appeal.adviserPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Deadline
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDeadline(appeal.deadline)}
                    </p>
                    <button
                      onClick={() => setShowDeadlineModal(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      {appeal.deadline ? "Update" : "Set"} Deadline
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Grounds for Appeal
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(appeal.grounds)
                      ? appeal.grounds.join(", ")
                      : appeal.grounds || "Not specified"}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Statement
                  </label>
                  <p className="mt-1 text-sm text-gray-900 break-words overflow-hidden">
                    {appeal.statement || "No statement provided."}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Status
                </h3>
                <div className="flex flex-col space-y-3">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under review">Under Review</option>
                    <option value="awaiting information">
                      Awaiting Information
                    </option>
                    <option value="decision made">Decision Made</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleStatusChange}
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Uploaded Evidence
                </h3>
                <div className="space-y-2">
                  {Array.isArray(appeal.evidence) &&
                  appeal.evidence.length > 0 ? (
                    appeal.evidence.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.originalName ||
                              file.filename ||
                              file.name ||
                              "Unknown file"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.fileSize
                              ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : "Unknown size"}{" "}
                            • {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No evidence files uploaded.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Comments Visible to Student
                </h3>
                <div className="space-y-4">
                  {Array.isArray(appeal.notes) &&
                  appeal.notes.filter((note) => !note.isInternal).length > 0 ? (
                    appeal.notes
                      .filter((note) => !note.isInternal)
                      .map((comment, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-indigo-500 pl-4 py-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {comment.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {comment.author?.firstName}{" "}
                                {comment.author?.lastName} •{" "}
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              disabled={submitting}
                              className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                              title="Delete comment"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                </div>

                <div className="mt-4">
                  <textarea
                    placeholder="Add a comment visible to the student..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={submitting}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Adding..." : "Add Comment"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Appeal
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Reviewer
                    </label>
                    <p className="text-sm text-gray-900">
                      {appeal?.assignedReviewer ? (
                        `${appeal.assignedReviewer.firstName} ${appeal.assignedReviewer.lastName}`
                      ) : (
                        <span className="text-gray-500">
                          No reviewer assigned
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Priority
                    </label>
                    <p className="text-sm text-gray-900">
                      {appeal?.priority ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            appeal.priority
                          )}`}
                        >
                          {appeal.priority}
                        </span>
                      ) : (
                        <span className="text-gray-500">No priority set</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (appeal?.assignedReviewer) {
                        setSelectedReviewer(appeal.assignedReviewer._id);
                      } else {
                        setSelectedReviewer("");
                      }
                      if (appeal?.priority) {
                        setSelectedPriority(appeal.priority);
                      } else {
                        setSelectedPriority("");
                      }
                      setShowAssignmentModal(true);
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign/Update Assignment
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Internal Notes
                </h3>
                <div className="space-y-3 mb-4">
                  {Array.isArray(appeal.notes) &&
                  appeal.notes.filter((note) => note.isInternal).length > 0 ? (
                    appeal.notes
                      .filter((note) => note.isInternal)
                      .map((note, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 rounded-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {note.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {note.author?.firstName} {note.author?.lastName}{" "}
                                • {formatDate(note.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={submitting}
                              className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                              title="Delete note"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No internal notes yet.
                    </p>
                  )}
                </div>

                <div>
                  <textarea
                    placeholder="Add internal note..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={submitting}
                    className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeadlineModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {appeal?.deadline ? "Update" : "Set"} Appeal Deadline
                </h3>
                <button
                  onClick={() => setShowDeadlineModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Deadline Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={deadlineReason}
                    onChange={(e) => setDeadlineReason(e.target.value)}
                    placeholder="Why is this deadline being set/updated?"
                    style={{ color: "#374151" }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeadlineModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetDeadline}
                    disabled={!newDeadline || submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Setting..." : "Set Deadline"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Appeal
                </h3>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    if (appeal?.assignedReviewer) {
                      setSelectedReviewer(appeal.assignedReviewer._id);
                    } else {
                      setSelectedReviewer("");
                    }
                    if (appeal?.priority) {
                      setSelectedPriority(appeal.priority);
                    } else {
                      setSelectedPriority("");
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Assign to Reviewer
                  </label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Select a reviewer</option>
                    {availableReviewers.map((reviewer) => (
                      <option key={reviewer._id} value={reviewer._id}>
                        {reviewer.firstName} {reviewer.lastName}{" "}
                        {reviewer.department ? `(${reviewer.department})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Set Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      if (appeal?.assignedReviewer) {
                        setSelectedReviewer(appeal.assignedReviewer._id);
                      } else {
                        setSelectedReviewer("");
                      }
                      if (appeal?.priority) {
                        setSelectedPriority(appeal.priority);
                      } else {
                        setSelectedPriority("");
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignAppeal}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Assigning..." : "Assign Appeal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </ProtectedRoute>
  );
}
