"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function AppealReview() {
  const [userInfo, setUserInfo] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [decision, setDecision] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams();
  const appealId = params.appealId;

  const fetchAppeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getReviewerAppeal(appealId);
      const appealData = response.appeal;

      const formattedAppeal = {
        id: appealData._id,
        studentName: appealData.student
          ? `${appealData.student.firstName} ${appealData.student.lastName}`
          : "Unknown Student",
        studentId: appealData.student?.studentId || "N/A",
        studentEmail: appealData.student?.email || "N/A",
        department:
          appealData.department || appealData.student?.department || "N/A",
        course: appealData.course || "N/A",
        status: appealData.status || "Pending",
        grounds: appealData.appealType || "N/A",
        submissionDate: appealData.createdAt,
        priority: appealData.priority || "Medium",
        hasAdviser: appealData.hasAdviser || false,
        adviserName: appealData.adviserName || "",
        adviserEmail: appealData.adviserEmail || "",
        adviserPhone: appealData.adviserPhone || "",
        description: appealData.statement || "No description provided",
        evidence: appealData.evidence || [],
        internalNotes:
          appealData.notes?.filter((note) => note.isInternal) || [],
        comments: appealData.notes?.filter((note) => !note.isInternal) || [],
        staffDocuments: appealData.staffDocuments || [],

        deadline: appealData.deadline,
        assignedReviewer: appealData.assignedReviewer
          ? `${appealData.assignedReviewer.firstName} ${appealData.assignedReviewer.lastName}`
          : "Unassigned",
        reviewDeadline: appealData.reviewDeadline,
        timeline: appealData.timeline || [],
        appealType: appealData.appealType,
        recommendation: appealData.recommendation || "",
        decision: appealData.decision || "",
      };

      setAppeal(formattedAppeal);
      setNewStatus(formattedAppeal.status);
      setRecommendation(formattedAppeal.recommendation);
      setDecision(formattedAppeal.decision);
    } catch (error) {
      setError("Failed to load appeal details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    fetchAppeal();
  }, [router, appealId]);

  const handleDownload = async (file) => {
    try {
      if (!appeal || !appeal.id) {
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
      }/api/reviewer/appeals/${appeal.id}/evidence/${encodeURIComponent(
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

  const handleUploadEvidence = async () => {
    if (!uploadedFile) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiService.uploadReviewerEvidence(appealId, [
        uploadedFile,
      ]);

      setUploadedFile(null);
      setShowUploadForm(false);
      await fetchAppeal();

      alert("Evidence uploaded successfully!");
    } catch (error) {
      setError(error.message || "Failed to upload evidence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      await apiService.addAppealNote(appealId, {
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
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await apiService.addAppealNote(appealId, {
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

  const handleStatusChange = async () => {
    if (!newStatus.trim()) return;

    try {
      setSubmitting(true);
      await apiService.updateAppealStatus(appealId, {
        status: newStatus,
        notes: `Status updated to: ${newStatus}`,
      });

      await fetchAppeal();
    } catch (error) {
      setError("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitReview = async () => {
    if (!recommendation.trim() || !decision.trim()) return;

    try {
      setSubmitting(true);

      await apiService.updateAppealStatus(appealId, {
        status: "decision made",
        notes: `Review completed. Recommendation: ${recommendation}. Decision: ${decision}.`,
      });

      await apiService.addAppealNote(appealId, {
        content: `Review Recommendation: ${recommendation}\nDecision: ${decision}`,
        isInternal: true,
      });

      await fetchAppeal();

      alert("Review submitted successfully!");
    } catch (error) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          <p className="mt-4 text-gray-600">Loading appeal details...</p>
        </div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No appeal data available.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (priority?.toLowerCase()) {
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

  return (
    <ProtectedRoute requiredRole="reviewer">
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Appeal Review
                </h1>
                <p className="text-gray-600 mt-1">
                  Reviewing appeal for {appeal.studentName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">
                  Status
                </h3>
                <span
                  className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getStatusColor(
                    appeal.status
                  )}`}
                >
                  {appeal.status}
                </span>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">
                  Priority
                </h3>
                <span
                  className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getPriorityColor(
                    appeal.priority
                  )}`}
                >
                  {appeal.priority}
                </span>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-base font-medium text-gray-500 mb-2">
                  Deadline
                </h3>
                <p className="text-base font-medium text-gray-900">
                  {new Date(appeal.deadline).toLocaleDateString()}
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
                        onClick={fetchAppeal}
                        className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.studentId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.studentEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.course}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submission Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appeal.submissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {appeal.hasAdviser && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Adviser Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appeal.adviserName && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Adviser Name
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {appeal.adviserName}
                            </p>
                          </div>
                        )}
                        {appeal.adviserEmail && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Adviser Email
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {appeal.adviserEmail}
                            </p>
                          </div>
                        )}
                        {appeal.adviserPhone && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Adviser Phone
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {appeal.adviserPhone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Appeal Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Grounds for Appeal
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {appeal.grounds}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words overflow-hidden">
                        {appeal.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Supporting Evidence
                    </h3>
                    <button
                      onClick={() => setShowUploadForm(!showUploadForm)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {showUploadForm ? "Cancel Upload" : "Upload Evidence"}
                    </button>
                  </div>

                  {showUploadForm && (
                    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Upload Additional Evidence
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="file"
                          onChange={(e) => setUploadedFile(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {uploadedFile && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {uploadedFile.name} (
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              onClick={handleUploadEvidence}
                              disabled={submitting}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? "Uploading..." : "Upload"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {Array.isArray(appeal.evidence) &&
                    appeal.evidence.length > 0 ? (
                      appeal.evidence.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {doc.originalName ||
                                doc.filename ||
                                doc.name ||
                                "Unknown Document"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {doc.fileSize
                                ? `${(doc.fileSize / 1024 / 1024).toFixed(
                                    2
                                  )} MB`
                                : "Unknown size"}{" "}
                              • Uploaded {formatDate(doc.uploadedAt)}
                              {doc.uploadedByRole && (
                                <span className="ml-2 text-xs text-gray-400">
                                  by {doc.uploadedByRole}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:bg-purple-50 px-3 py-1 rounded-md transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No supporting evidence uploaded.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Review Actions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Update
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Awaiting Info">Awaiting Info</option>
                        <option value="Review Complete">Review Complete</option>
                        <option value="Referred to Panel">
                          Referred to Panel
                        </option>
                      </select>
                      <button
                        onClick={handleStatusChange}
                        disabled={submitting}
                        className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Updating..." : "Update Status"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommendation
                      </label>
                      <textarea
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        placeholder="Enter your recommendation..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Decision
                      </label>
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                      >
                        <option value="">Select decision...</option>
                        <option value="Appeal Upheld">Appeal Upheld</option>
                        <option value="Appeal Rejected">Appeal Rejected</option>
                        <option value="Partial Uphold">Partial Uphold</option>
                        <option value="Referred to Academic Panel">
                          Referred to Academic Panel
                        </option>
                      </select>
                    </div>

                    <button
                      onClick={handleSubmitReview}
                      disabled={
                        !recommendation.trim() || !decision.trim() || submitting
                      }
                      className="w-full bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Internal Notes
                  </h3>
                  <div className="space-y-3 mb-4">
                    {appeal.internalNotes &&
                    Array.isArray(appeal.internalNotes) &&
                    appeal.internalNotes.length > 0 ? (
                      appeal.internalNotes.map((note, index) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-900">
                            {typeof note.content === "string"
                              ? note.content
                              : typeof note.note === "string"
                              ? note.note
                              : "No content"}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {note.author?.firstName && note.author?.lastName
                              ? `${note.author.firstName} ${note.author.lastName}`
                              : note.author?.firstName ||
                                note.author?.lastName ||
                                "Unknown"}{" "}
                            •{" "}
                            {note.createdAt
                              ? new Date(note.createdAt).toLocaleDateString()
                              : note.timestamp || "Unknown time"}
                          </p>
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
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add internal note..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 text-gray-900"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || submitting}
                      className="mt-2 w-full bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Adding..." : "Add Note"}
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Student Comments
                  </h3>
                  <div className="space-y-3 mb-4">
                    {appeal.comments &&
                    Array.isArray(appeal.comments) &&
                    appeal.comments.length > 0 ? (
                      appeal.comments.map((comment, index) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-900">
                            {typeof comment.content === "string"
                              ? comment.content
                              : typeof comment.comment === "string"
                              ? comment.comment
                              : "No content"}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {comment.author?.firstName &&
                            comment.author?.lastName
                              ? `${comment.author.firstName} ${comment.author.lastName}`
                              : comment.author?.firstName ||
                                comment.author?.lastName ||
                                "Unknown"}{" "}
                            •{" "}
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleDateString()
                              : comment.timestamp || "Unknown time"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add comment visible to student..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 text-gray-900"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="mt-2 w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Adding..." : "Add Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
