"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function NewAppeal() {
  const [userInfo, setUserInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    declaration: false,
    deadlineCheck: false,

    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    course: "",
    department: "",
    customDepartment: "",

    hasAdviser: false,
    adviserName: "",
    adviserEmail: "",
    adviserPhone: "",

    appealType: "",

    grounds: [],

    statement: "",

    evidence: [],

    confirmAll: false,

    submitted: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [stepErrors, setStepErrors] = useState({});

  useEffect(() => {
    if (!Array.isArray(formData.evidence)) {
      setFormData((prev) => ({ ...prev, evidence: [] }));
    }
  }, [formData.evidence]);

  const router = useRouter();

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

    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      studentId: user.studentId || "",
      email: user.email || "",
      department: user.department || "",
    }));
  }, [router]);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const steps = [
    {
      id: 1,
      title: "Declaration & Deadline",
      description: "Check eligibility",
    },
    { id: 2, title: "Personal Information", description: "Your details" },
    {
      id: 3,
      title: "Department Selection",
      description: "Select your department",
    },
    { id: 4, title: "Adviser Details", description: "Optional adviser info" },
    { id: 5, title: "Appeal Type", description: "Select appeal category" },
    { id: 6, title: "Grounds for Appeal", description: "Reason for appeal" },
    { id: 7, title: "Appeal Statement", description: "Detailed explanation" },
    { id: 8, title: "Evidence Upload", description: "Supporting documents" },
    { id: 9, title: "Final Confirmation", description: "Review and confirm" },
    { id: 10, title: "Submit", description: "Submit your appeal" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `"${file.name}" exceeds 10MB limit (${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)}MB)`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `"${file.name}" has unsupported type "${file.type}". Please upload PDF, DOC, DOCX, JPG, or PNG files only.`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    setUploadError(null);
    const newFiles = [];
    const errors = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileId = Date.now() + Math.random();
        newFiles.push({
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join("\n"));
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      const fileInfo = newFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setFormData((prev) => {
        const newEvidence = [...prev.evidence, ...fileInfo];
        return {
          ...prev,
          evidence: newEvidence,
        };
      });

      setUploadSuccess(`${newFiles.length} file(s) uploaded successfully!`);
      setUploadError(null);

      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        setFormData((prevForm) => {
          const newEvidence = prevForm.evidence.filter(
            (f) => f.name !== fileToRemove.name
          );
          return {
            ...prevForm,
            evidence: newEvidence,
          };
        });
        if (fileToRemove.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const nextStep = () => {
    setFieldErrors({});
    setStepErrors({});

    if (currentStep === 1 && !formData.deadlineCheck) {
      router.push("/student/late-submission-info");
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors(stepErrors);
      setStepErrors({
        [currentStep]: "Please fix the errors above before proceeding",
      });
      return;
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.declaration)
          errors.declaration = "Declaration must be accepted";
        if (!formData.deadlineCheck)
          errors.deadlineCheck = "Deadline check must be confirmed";
        break;
      case 2:
        if (!formData.course.trim()) errors.course = "Course is required";
        break;
      case 3:
        if (!formData.department.trim()) {
          errors.department = "Department selection is required";
        } else if (
          formData.department === "Other" &&
          !formData.customDepartment.trim()
        ) {
          errors.department = "Please specify your department";
        }
        break;
      case 5:
        if (!formData.appealType) errors.appealType = "Appeal type is required";
        break;
      case 6:
        if (!formData.grounds.length)
          errors.grounds = "At least one ground must be selected";
        break;
      case 7:
        if (!formData.statement.trim())
          errors.statement = "Appeal statement is required";
        break;
      case 9:
        if (!formData.confirmAll)
          errors.confirmAll = "Final confirmation must be accepted";
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.declaration) errors.push("Declaration must be accepted");
    if (!formData.deadlineCheck)
      errors.push("Deadline check must be confirmed");
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.studentId.trim()) errors.push("Student ID is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.course.trim()) errors.push("Course is required");
    if (!formData.department.trim())
      errors.push("Department selection is required");
    if (!formData.appealType) errors.push("Appeal type is required");
    if (!formData.grounds.length)
      errors.push("At least one ground must be selected");
    if (!formData.statement.trim()) errors.push("Appeal statement is required");
    if (!formData.confirmAll)
      errors.push("Final confirmation must be accepted");

    return errors;
  };

  const handleSubmit = async () => {
    if (!userInfo) {
      setError("User not authenticated");
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();

      formDataToSend.append("declaration", formData.declaration);
      formDataToSend.append("deadlineCheck", formData.deadlineCheck);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("studentId", formData.studentId);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone || "");
      formDataToSend.append("course", formData.course);
      formDataToSend.append(
        "department",
        formData.department === "Other"
          ? formData.customDepartment
          : formData.department
      );
      formDataToSend.append("hasAdviser", formData.hasAdviser);
      formDataToSend.append(
        "adviserName",
        formData.hasAdviser ? formData.adviserName : ""
      );
      formDataToSend.append(
        "adviserEmail",
        formData.hasAdviser ? formData.adviserEmail : ""
      );
      formDataToSend.append(
        "adviserPhone",
        formData.hasAdviser ? formData.adviserPhone : ""
      );
      formDataToSend.append("appealType", formData.appealType);
      formData.grounds.forEach((ground) => {
        formDataToSend.append("grounds", ground);
      });
      formDataToSend.append("statement", formData.statement);
      formDataToSend.append("moduleCode", "");
      formDataToSend.append(
        "academicYear",
        new Date().getFullYear().toString()
      );
      formDataToSend.append("semester", "1");
      formDataToSend.append("confirmAll", formData.confirmAll);

      uploadedFiles.forEach((fileObj) => {
        formDataToSend.append("evidence", fileObj.file);
      });

      const response = await apiService.createAppeal(formDataToSend);

      handleInputChange("submitted", true);

      setFieldErrors({});
      setStepErrors({});
      setUploadError(null);
      setUploadSuccess(null);

      setTimeout(() => {
        router.push("/student");
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to submit appeal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" fill="#dc2626" />
            <path
              fill="white"
              d="M10 4a1 1 0 011 1v5a1 1 0 11-2 0V5a1 1 0 011-1zm0 10a1 1 0 100 2 1 1 0 000-2z"
            />
          </svg>
          {fieldErrors[fieldName]}
        </p>
      );
    }
    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Important: Appeal Deadline
                  </h3>
                  <p className="text-yellow-700">
                    You must submit your appeal within 10 working days of
                    receiving your results. Late appeals will not be considered.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.deadlineCheck}
                  onChange={(e) =>
                    handleInputChange("deadlineCheck", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I confirm that I am submitting this appeal within the required
                  deadline
                </span>
              </label>
              {fieldErrors.deadlineCheck && (
                <p className="ml-7 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" fill="#dc2626" />
                    <path
                      fill="white"
                      d="M10 4a1 1 0 011 1v5a1 1 0 11-2 0V5a1 1 0 011-1zm0 10a1 1 0 100 2 1 1 0 000-2z"
                    />
                  </svg>
                  {fieldErrors.deadlineCheck}
                </p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.declaration}
                  onChange={(e) =>
                    handleInputChange("declaration", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I declare that the information provided in this appeal is true
                  and accurate to the best of my knowledge
                </span>
              </label>
              {fieldErrors.declaration && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.declaration}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-populated from your profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-populated from your profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Auto-populated from your profile"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This field is automatically populated from your registered
                  student profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-populated from your profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                    fieldErrors.course
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., Computer Science, Medicine, Law"
                  required
                />
                {renderFieldError("course")}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Department Selection
              </h3>
              <p className="text-blue-700">
                Please select your academic department. This information helps
                reviewers understand your academic context.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                  fieldErrors.department
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              >
                <option value="">Select your department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
                <option value="Other">Other</option>
              </select>
              {renderFieldError("department")}
              {formData.department === "Other" && (
                <input
                  type="text"
                  placeholder="Please specify your department"
                  value={formData.customDepartment}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  onChange={(e) =>
                    handleInputChange("customDepartment", e.target.value)
                  }
                />
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Adviser Information (Optional)
              </h3>
              <p className="text-blue-700">
                You may choose to have an adviser represent you during the
                appeal process. This is not required but can be helpful for
                complex cases.
              </p>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasAdviser}
                onChange={(e) =>
                  handleInputChange("hasAdviser", e.target.checked)
                }
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                I would like to include an adviser in my appeal
              </span>
            </label>

            {formData.hasAdviser && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adviser Name
                    </label>
                    <input
                      type="text"
                      value={formData.adviserName}
                      onChange={(e) =>
                        handleInputChange("adviserName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adviser Email
                    </label>
                    <input
                      type="email"
                      value={formData.adviserEmail}
                      onChange={(e) =>
                        handleInputChange("adviserEmail", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adviser Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.adviserPhone}
                      onChange={(e) =>
                        handleInputChange("adviserPhone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What type of appeal are you submitting? *
              </label>
              <div className="space-y-3">
                {[
                  "Academic Judgment",
                  "Procedural Irregularity",
                  "Extenuating Circumstances",
                  "Assessment Irregularity",
                  "Other",
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="appealType"
                      value={type}
                      checked={formData.appealType === type}
                      onChange={(e) =>
                        handleInputChange("appealType", e.target.value)
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.appealType && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.appealType}
                </p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What are the grounds for your appeal? (Select all that apply) *
              </label>
              <div className="space-y-3">
                {[
                  "Illness or medical condition",
                  "Bereavement",
                  "Personal circumstances",
                  "Technical issues during assessment",
                  "Inadequate supervision",
                  "Unclear assessment criteria",
                  "Other",
                ].map((ground) => (
                  <label key={ground} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.grounds.includes(ground)}
                      onChange={(e) => {
                        const newGrounds = e.target.checked
                          ? [...formData.grounds, ground]
                          : formData.grounds.filter((g) => g !== ground);
                        handleInputChange("grounds", newGrounds);
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{ground}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.grounds && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fieldErrors.grounds}
                </p>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide a detailed statement explaining your appeal *
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) => handleInputChange("statement", e.target.value)}
                rows={8}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                  fieldErrors.statement
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Please provide a clear and detailed explanation of your appeal, including relevant dates, circumstances, and any supporting evidence..."
                required
              />
              {renderFieldError("statement")}
              <p className="mt-2 text-sm text-gray-500">
                Be as specific as possible. Include dates, names, and any
                relevant details that support your case.
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Supporting Evidence
              </h3>
              <p className="text-blue-700">
                Upload any relevant documents that support your appeal (medical
                certificates, letters, etc.). Maximum file size: 10MB per file.
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
                >
                  Choose Files
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG up to 10MB each
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Or drag and drop files here
                </p>
              </div>
            </div>

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
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
                    <h3 className="text-sm font-medium text-green-800">
                      Upload Successful
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      {uploadSuccess}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
                    <h3 className="text-sm font-medium text-red-800">
                      Upload Errors
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <pre className="whitespace-pre-wrap">{uploadError}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {file.type.startsWith("image/") ? (
                            <div className="w-10 h-10 rounded border overflow-hidden">
                              <Image
                                src={file.preview}
                                alt={file.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.type}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex-shrink-0 ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What to upload:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Medical certificates or doctor&apos;s notes</li>
                <li>• Official letters or correspondence</li>
                <li>• Screenshots of technical issues</li>
                <li>• Any other relevant supporting documentation</li>
              </ul>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Final Review
              </h3>
              <p className="text-green-700">
                Please review all the information you have provided before
                submitting your appeal.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Personal Information
                </h4>
                <p className="text-sm text-gray-600">
                  {formData.firstName} {formData.lastName} ({formData.studentId}
                  )
                </p>
                <p className="text-sm text-gray-600">{formData.email}</p>
                <p className="text-sm text-gray-600">
                  <strong>Department:</strong>{" "}
                  {formData.department === "Other"
                    ? formData.customDepartment
                    : formData.department || "Not selected"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Course:</strong> {formData.course || "Not specified"}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Appeal Details
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {formData.appealType}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Grounds:</strong> {formData.grounds.join(", ")}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Supporting Evidence
                </h4>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <span>• {file.name}</span>
                        <span className="text-gray-400">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No supporting evidence uploaded
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Data Protection & Privacy
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                I consent to the University of Sheffield processing my personal
                data, including any sensitive evidence I upload, for the purpose
                of handling my academic appeal, in accordance with GDPR.
              </p>
            </div>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.confirmAll}
                onChange={(e) =>
                  handleInputChange("confirmAll", e.target.checked)
                }
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                I confirm that all information provided is accurate and complete
                to the best of my knowledge
              </span>
            </label>
            {fieldErrors.confirmAll && (
              <p className="ml-7 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {fieldErrors.confirmAll}
              </p>
            )}
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            {formData.submitted ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Appeal Submitted Successfully!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your appeal has been submitted and is under review. You will
                  receive confirmation and updates via email.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Submit Your Appeal
                </h3>
                <p className="text-gray-600 mb-6">
                  By clicking submit, you confirm that all information provided
                  is accurate and complete. You will not be able to edit your
                  appeal after submission.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.confirmAll}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    loading || !formData.confirmAll
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Appeal"
                  )}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
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

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/student")}
                  className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  aria-label="Cancel appeal creation and return to dashboard"
                >
                  ← Cancel
                </button>
              </div>
              <nav
                className="flex items-center"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-label={`Step ${currentStep} of ${steps.length}`}
              >
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        step.id <= currentStep
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                      aria-label={`Step ${step.id}: ${step.title}${
                        step.id === currentStep
                          ? " (current)"
                          : step.id < currentStep
                          ? " (completed)"
                          : " (pending)"
                      }`}
                    >
                      {step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step.id < currentStep
                            ? "bg-purple-600"
                            : "bg-gray-200"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="max-w-4xl mx-auto px-6 py-8"
          role="main"
          aria-label="Appeal creation form"
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / steps.length) * 100)}% Complete
                </span>
              </div>
              <div
                className="w-full bg-gray-200 rounded-full h-2"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-label={`Appeal creation progress: step ${currentStep} of ${steps.length}`}
              >
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-gray-600">
                {steps[currentStep - 1].description}
              </p>
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

            {renderStepContent()}

            {currentStep !== 10 && (
              <nav
                className="flex justify-between mt-8 pt-6 border-t border-gray-200"
                aria-label="Form navigation"
              >
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 border border-gray-300 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    currentStep === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-label={
                    currentStep === 1
                      ? "Previous step (disabled)"
                      : "Go to previous step"
                  }
                >
                  Previous
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label={
                    currentStep === 9
                      ? "Review and submit appeal"
                      : "Go to next step"
                  }
                >
                  {currentStep === 9 ? "Review & Submit" : "Next"}
                </button>
              </nav>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
